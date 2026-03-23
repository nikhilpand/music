"""
Sukoon Backend Server
Wraps ytmusicapi for search + yt-dlp for audio stream URLs
Run: python -m uvicorn server:app --reload --port 8000
"""

import json
import asyncio
from functools import lru_cache
from typing import Optional

from fastapi import FastAPI, HTTPException, Query  # type: ignore
from fastapi.middleware.cors import CORSMiddleware  # type: ignore
from ytmusicapi import YTMusic  # type: ignore
import yt_dlp  # type: ignore

app = FastAPI(title="Sukoon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YTMusic (no auth needed for public search)
ytm = YTMusic()


def _format_thumbnail(thumbnails: list) -> str:
    """Pick best quality thumbnail URL."""
    if not thumbnails:
        return ""
    # Sort by resolution desc, pick biggest
    sorted_thumbs = sorted(thumbnails, key=lambda t: t.get("width", 0), reverse=True)
    return sorted_thumbs[0]["url"]


def _format_song(item: dict) -> dict:
    """Normalize a ytmusicapi result into our Track format."""
    result_type = item.get("resultType", "")
    video_id = item.get("videoId", "")
    title = item.get("title", "Unknown")
    
    # Artists
    artists_raw = item.get("artists", []) or []
    if isinstance(artists_raw, list):
        artist = ", ".join(a.get("name", "") for a in artists_raw if a.get("name"))
    else:
        artist = str(artists_raw)
    if not artist:
        artist = item.get("artist", "Unknown Artist")

    # Album
    album_obj = item.get("album") or {}
    album = album_obj.get("name", "") if isinstance(album_obj, dict) else ""

    # Thumbnail
    thumbnails = item.get("thumbnails", [])
    cover = _format_thumbnail(thumbnails)

    # Duration
    duration = item.get("duration", "")
    duration_seconds = item.get("duration_seconds", 0)

    return {
        "id": video_id or item.get("browseId", ""),
        "videoId": video_id,
        "title": title,
        "artist": artist,
        "album": album,
        "coverSrc": cover,
        "duration": duration,
        "duration_seconds": duration_seconds,
        "resultType": result_type,
    }


@app.get("/")
async def root():
    return {"status": "ok", "message": "Sukoon API is running"}


@app.get("/search")
async def search(
    q: str = Query(..., description="Search query"),
    filter: Optional[str] = Query("songs", description="songs | videos | albums | artists | playlists"),
    limit: int = Query(20, ge=1, le=50),
):
    """Search YouTube Music for songs."""
    try:
        filter_val = filter if filter != "all" else None
        results = ytm.search(q, filter=filter_val, limit=limit)
        
        formatted = []
        for item in results:
            # Only include items with a videoId (actual playable tracks)
            if item.get("videoId") or (filter_val in [None, "all"] and item.get("resultType") in ["song", "video"]):
                formatted.append(_format_song(item))
        
        return {"query": q, "results": formatted, "count": len(formatted)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/suggestions")
async def suggestions(q: str = Query(..., description="Partial query for autocomplete")):
    """Get search suggestions."""
    try:
        suggs = ytm.get_search_suggestions(q)
        return {"suggestions": suggs[:8]}
    except Exception as e:
        return {"suggestions": []}


@app.get("/stream/{video_id}")
async def stream_audio(video_id: str):
    """
    Real-time audio streaming via yt-dlp subprocess pipe.
    Starts playing in ~2-3 seconds — no full download wait.
    """
    import subprocess
    from fastapi.responses import StreamingResponse

    yt_url = f"https://www.youtube.com/watch?v={video_id}"

    cmd = [
        "yt-dlp",
        "--format", "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio",
        "--output", "-",
        "--no-playlist",
        "--quiet",
        "--no-warnings",
        yt_url,
    ]

    try:
        proc = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            bufsize=0,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start yt-dlp: {e}")

    assert proc.stdout is not None  # guaranteed by stdout=subprocess.PIPE
    stdout = proc.stdout

    async def audio_generator():
        try:
            while True:
                chunk = await asyncio.get_event_loop().run_in_executor(None, stdout.read, 65536)
                if not chunk:
                    break
                yield chunk
        finally:
            try:
                proc.kill()
                stdout.close()
            except Exception:
                pass

    return StreamingResponse(
        audio_generator(),
        media_type="audio/mp4",
        headers={"Cache-Control": "no-cache"},
    )


@app.get("/trending")
async def get_trending():
    """Get trending/home charts from YT Music."""
    try:
        charts = ytm.get_charts(country="IN")
        songs = []
        
        # Extract songs from charts
        if "songs" in charts:
            items = charts["songs"].get("items", [])[:10]
            for item in items:
                songs.append(_format_song(item))
        
        return {"trending": songs}
    except Exception as e:
        # Return empty list on failure (charts may require region support)
        return {"trending": []}


@app.get("/new-releases")
async def get_new_releases():
    """Get new song releases."""
    try:
        home = ytm.get_home()
        results = []
        for section in home[:3]:
            if isinstance(section, dict):
                title = section.get("title", "")
                items = section.get("contents", [])[:5]
                for item in items:
                    if item.get("videoId"):
                        formatted = _format_song(item)
                        formatted["section"] = title
                        results.append(formatted)
        return {"sections": results}
    except Exception as e:
        return {"sections": []}


@app.get("/playlist")
async def import_playlist(url: str = Query(..., description="YouTube Music or YouTube playlist URL")):
    """Import all tracks from a YouTube/YouTube Music playlist URL."""
    import re
    
    # Extract playlist ID from various URL formats
    # Supports: list=PLxxxxxxx, /playlist/PLxxxxxxx, music.youtube.com playlists, VLPL... (YTM)
    playlist_id = None
    
    patterns = [
        r"[?&]list=([A-Za-z0-9_-]+)",
        r"/playlist/([A-Za-z0-9_-]+)",
    ]
    for pat in patterns:
        m = re.search(pat, url)
        if m:
            playlist_id = m.group(1)
            break
    
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Could not extract playlist ID from URL. Make sure it contains ?list=... or /playlist/...")
    
    try:
        # ytmusicapi can fetch playlists — strip VL prefix if present (YTM adds it)
        browse_id = playlist_id
        if browse_id.startswith("VL"):
            browse_id = browse_id[2:]
        
        playlist = ytm.get_playlist(browse_id, limit=100)
        tracks = []
        
        for item in playlist.get("tracks", []):
            if not item.get("videoId"):
                continue
            formatted = _format_song(item)
            tracks.append(formatted)
        
        return {
            "playlistId": playlist_id,
            "title": playlist.get("title", "Imported Playlist"),
            "description": playlist.get("description", ""),
            "author": (playlist.get("author") or [{}])[0].get("name", "") if isinstance(playlist.get("author"), list) else str(playlist.get("author", "")),
            "trackCount": len(tracks),
            "tracks": tracks,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Playlist import failed: {str(e)}")



import httpx  # type: ignore
import random

# ── Fallback shayaris (shown if Reddit is unreachable) ────────────────────────
FALLBACK_SHAYARIS = [
    {"text": "Tum yaad aate ho toh waqt thahar sa jaata hai,\nDil ki har dhadkan mein ek nasha sa chha jaata hai.", "author": "Sukoon Collection", "category": "love"},
    {"text": "Raat ne phir tere naam ki chaadar odh li,\nChaand ne chupke se teri baat chhed di.", "author": "Sukoon Collection", "category": "love"},
    {"text": "Jo alfaaz na keh paaye, unhe hawa likh jaati hai,\nJo ehsaas chhup jaaye, unhe aankhen padh jaati hain.", "author": "Sukoon Collection", "category": "shayari"},
    {"text": "Zindagi ek safar hai suhana,\nYahan kal kya ho kisne jaana.", "author": "Sukoon Collection", "category": "inspire"},
    {"text": "Teri muskurahat mein ek jahan chhupa hai,\nTeri nigaahon mein saawan basa hai.", "author": "Sukoon Collection", "category": "love"},
    {"text": "Har pal yaad teri aati hai,\nDil ko chain na aata hai.\nAankh se ansoo bah jaate hain,\nJab tujhe hum yaad karte hain.", "author": "Sukoon Collection", "category": "shayari"},
    {"text": "Hausla rakh, toofan bhi guzar jaate hain,\nRaaton ke baad subah bhi aati hai.", "author": "Sukoon Collection", "category": "inspire"},
    {"text": "Woh jo milta hai toh dil ko sukoon milta hai,\nWoh jo chala jaata hai toh wajood hil jaata hai.", "author": "Sukoon Collection", "category": "love"},
]


@app.get("/shayari")
async def get_shayari(limit: int = Query(25, ge=5, le=50)):
    """Fetch real shayaris from Reddit r/Shayari and r/HindiPoetry."""
    results = []
    headers = {"User-Agent": "Sukoon/1.0 (sukoon-player)"}

    async with httpx.AsyncClient(timeout=8.0, headers=headers) as client:
        subreddits = [
            ("Shayari", "hot"),
            ("HindiPoetry", "top"),
            ("urdushayari", "hot"),
        ]
        for subreddit, sort in subreddits:
            try:
                url = f"https://www.reddit.com/r/{subreddit}/{sort}.json?limit=30&t=week"
                resp = await client.get(url)
                if resp.status_code != 200:
                    continue
                data = resp.json()
                posts = data.get("data", {}).get("children", [])
                for post in posts:
                    p = post.get("data", {})
                    # Skip media/link posts, keep self-text shayaris
                    text = p.get("selftext", "").strip() or p.get("title", "").strip()
                    if not text or len(text) < 20 or len(text) > 600:
                        continue
                    if p.get("is_video") or p.get("url", "").endswith((".jpg", ".png", ".gif")):
                        continue
                    # Clean up
                    text = text.replace("\r\n", "\n").strip()
                    results.append({
                        "text": text,
                        "author": p.get("author", "Anonymous"),
                        "source": f"r/{subreddit}",
                        "upvotes": p.get("score", 0),
                        "category": "shayari",
                        "url": f"https://reddit.com{p.get('permalink', '')}",
                    })
            except Exception:
                continue

    # Sort by upvotes, shuffle top results for freshness
    results.sort(key=lambda x: x.get("upvotes", 0), reverse=True)
    top = results[:60]  # type: ignore[misc]
    random.shuffle(top)

    # Pad with fallbacks if we got too few
    if len(top) < 8:
        top = FALLBACK_SHAYARIS + top

    return {"shayaris": top[:limit], "total": len(top), "source": "reddit"}


@app.get("/quotes")
async def get_quotes(category: str = Query("inspire", description="love | inspire | life | wisdom")):
    """Fetch motivational quotes from quotable.io (open source)."""
    CATEGORY_MAP = {
        "inspire": ["inspirational", "motivational", "success"],
        "love": ["love", "friendship", "happiness"],
        "life": ["life", "wisdom", "philosophy"],
        "wisdom": ["wisdom", "knowledge", "truth"],
    }
    tags = CATEGORY_MAP.get(category, ["inspirational"])
    tag = random.choice(tags)

    try:
        async with httpx.AsyncClient(timeout=6.0) as client:
            resp = await client.get(
                f"https://api.quotable.io/quotes/random?limit=20&tags={tag}&maxLength=200"
            )
            if resp.status_code == 200:
                data = resp.json()
                quotes = []
                for q in data:
                    quotes.append({
                        "text": q.get("content", ""),
                        "author": q.get("author", "Unknown"),
                        "source": "quotable.io",
                        "category": category,
                        "tags": q.get("tags", []),
                    })
                random.shuffle(quotes)
                return {"quotes": quotes}
    except Exception:
        pass

    # Fallback quotes
    fallback = [
        {"text": "The only way to do great work is to love what you do.", "author": "Steve Jobs", "source": "fallback", "category": category},
        {"text": "In the middle of difficulty lies opportunity.", "author": "Albert Einstein", "source": "fallback", "category": category},
        {"text": "It does not matter how slowly you go as long as you do not stop.", "author": "Confucius", "source": "fallback", "category": category},
        {"text": "Life is what happens when you're busy making other plans.", "author": "John Lennon", "source": "fallback", "category": category},
        {"text": "The future belongs to those who believe in the beauty of their dreams.", "author": "Eleanor Roosevelt", "source": "fallback", "category": category},
    ]
    random.shuffle(fallback)
    return {"quotes": fallback}

