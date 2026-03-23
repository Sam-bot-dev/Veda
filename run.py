"""
Veda — Clean startup script
Suppresses Python 3.9 google-api deprecation warnings.

Usage:
    python3 run.py

Or with auto-reload (development):
    python3 run.py --reload
"""
import warnings
import sys
import os

# ── Suppress Python 3.9 google-api FutureWarnings ──────────────────
warnings.filterwarnings("ignore", category=FutureWarning, module="google")
warnings.filterwarnings("ignore", message=".*non-supported Python version.*")
warnings.filterwarnings("ignore", message=".*importlib.metadata.*")

# ── Suppress the importlib.metadata warning from pip/pkg internals ─
import importlib
try:
    # Patch the missing attribute that causes the error on Python 3.9
    import importlib.metadata as _im
    if not hasattr(_im, "packages_distributions"):
        from importlib.metadata import packages_distributions as _pd
        _im.packages_distributions = _pd
except Exception:
    pass

# ── Now import and run the app ──────────────────────────────────────
from app import app

if __name__ == "__main__":
    port  = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "development") == "development"
    reload = "--reload" in sys.argv

    print()
    print("=" * 58)
    print("  Veda Pharmacy Backend")
    print(f"  Python:   {sys.version.split()[0]}")
    print(f"  URL:      http://127.0.0.1:{port}")
    print(f"  Debug:    {debug}")
    print()
    print(f"  Open:     http://127.0.0.1:{port}/signin")
    print("=" * 58)
    print()

    app.run(
        host="0.0.0.0",
        port=port,
        debug=debug,
        use_reloader=reload
    )
