import hashlib
import random
from pathlib import Path
from typing import Dict, List, Optional
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import xml.etree.ElementTree as ET

@asynccontextmanager
async def lifespan(_app: FastAPI):
    # Startup: Load avatar components
    load_avatar_components()
    yield
    # Shutdown: Cleanup if needed
    pass

app = FastAPI(
    title="Avatar Generator API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base path for avatar components
COMPONENTS_DIR = Path("Separate Atoms")

# Avatar component categories for bust style
CATEGORIES = ["head", "face", "body", "facial-hair", "accessories"]

# Global storage for avatar components
avatar_components: Dict[str, List[Dict[str, str]]] = {}


class AvatarSelection(BaseModel):
    head: int
    face: int
    body: int
    facial_hair: int
    accessories: int


class AvatarResponse(BaseModel):
    key: str
    svg: str


def load_avatar_components():
    """Load all SVG components from the Separate Atoms directory."""
    global avatar_components

    for category in CATEGORIES:
        category_path = COMPONENTS_DIR / category
        if not category_path.exists():
            raise FileNotFoundError(f"Category directory not found: {category_path}")

        components = []
        svg_files = sorted(category_path.glob("*.svg"))

        for svg_file in svg_files:
            components.append({
                "id": len(components),
                "name": svg_file.stem,
                "path": str(svg_file)
            })

        avatar_components[category] = components
        print(f"Loaded {len(components)} components for {category}")


def encode_key(selection: AvatarSelection) -> str:
    """Encode avatar selection into a compact hash key."""
    # Create a deterministic string from selection
    selection_str = f"{selection.head}-{selection.face}-{selection.body}-{selection.facial_hair}-{selection.accessories}"
    # Generate short hash
    hash_obj = hashlib.sha256(selection_str.encode())
    short_hash = hash_obj.hexdigest()[:8]
    # Store the mapping for decoding (in production, use a database)
    key_mapping[short_hash] = selection
    return short_hash


def decode_key(key: str) -> Optional[AvatarSelection]:
    """Decode hash key back to avatar selection."""
    return key_mapping.get(key)


def combine_svg_components(selection: AvatarSelection) -> str:
    """Combine multiple SVG components into a single SVG."""
    # Define namespace
    ET.register_namespace('', 'http://www.w3.org/2000/svg')

    # Create master SVG with viewBox from bust template
    svg_attrs = {
        'width': '1136px',
        'height': '1533px',
        'viewBox': '0 0 1136 1533',
        'version': '1.1',
        'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xlink': 'http://www.w3.org/1999/xlink'
    }
    root = ET.Element('svg', svg_attrs)

    # Create main group
    main_group = ET.SubElement(root, 'g', {
        'id': 'avatar',
        'stroke': 'none',
        'stroke-width': '1',
        'fill': 'none',
        'fill-rule': 'evenodd'
    })

    # Component positions from bust.svg
    component_positions = {
        'body': (147.0, 639.0),
        'head': (372.0, 180.0),
        'face': (531.0, 366.0),
        'facial-hair': (494.999934, 517.999659),
        'accessories': (419.0, 421.0)
    }

    # Load and add each component in the correct order (back to front)
    components_to_add = [
        ('body', selection.body),
        ('head', selection.head),
        ('face', selection.face),
        ('facial-hair', selection.facial_hair),
        ('accessories', selection.accessories)
    ]

    for category, index in components_to_add:
        component = avatar_components[category][index]
        tree = ET.parse(component["path"])
        component_root = tree.getroot()

        # Find the main group in the component SVG
        component_group = component_root.find('.//{http://www.w3.org/2000/svg}g')

        if component_group is not None:
            # Create a wrapper group with transform
            x, y = component_positions[category]
            wrapper = ET.SubElement(main_group, 'g', {
                'transform': f'translate({x}, {y})'
            })

            # Copy all elements from component group to wrapper
            for child in component_group:
                wrapper.append(child)

    # Convert to string
    svg_string = ET.tostring(root, encoding='unicode', method='xml')
    return svg_string


# In-memory key mapping (use database in production)
key_mapping: Dict[str, AvatarSelection] = {}


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Avatar Generator API",
        "version": "1.0.0",
        "endpoints": {
            "options": "/options",
            "generate": "/avatar/generate",
            "get_avatar": "/avatar/{key}",
            "random": "/avatar/random"
        }
    }


@app.get("/options")
async def get_options():
    """Get all available avatar component options."""
    if not avatar_components:
        raise HTTPException(status_code=500, detail="Avatar components not loaded")

    return {
        "categories": {
            category: [
                {"id": comp["id"], "name": comp["name"]}
                for comp in components
            ]
            for category, components in avatar_components.items()
        }
    }


@app.post("/avatar/generate", response_model=AvatarResponse)
async def generate_avatar(selection: AvatarSelection):
    """Generate an avatar from component selection and return key with SVG."""
    # Validate selection indices
    for category in CATEGORIES:
        category_key = category.replace("-", "_")
        selection_value = getattr(selection, category_key)
        max_index = len(avatar_components[category]) - 1

        if selection_value < 0 or selection_value > max_index:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid {category} index. Must be between 0 and {max_index}"
            )

    # Generate key
    key = encode_key(selection)

    # Combine SVG components
    svg = combine_svg_components(selection)

    return AvatarResponse(key=key, svg=svg)


@app.get("/avatar/random", response_model=AvatarResponse)
async def get_random_avatar():
    """Generate a random avatar variant."""
    if not avatar_components:
        raise HTTPException(status_code=500, detail="Avatar components not loaded")

    # Generate random selection
    selection = AvatarSelection(
        head=random.randint(0, len(avatar_components["head"]) - 1),
        face=random.randint(0, len(avatar_components["face"]) - 1),
        body=random.randint(0, len(avatar_components["body"]) - 1),
        facial_hair=random.randint(0, len(avatar_components["facial-hair"]) - 1),
        accessories=random.randint(0, len(avatar_components["accessories"]) - 1)
    )

    # Generate key
    key = encode_key(selection)

    # Combine SVG components
    svg = combine_svg_components(selection)

    return AvatarResponse(key=key, svg=svg)


@app.get("/avatar/{key}", response_model=AvatarResponse)
async def get_avatar(key: str):
    """Get avatar SVG by key."""
    selection = decode_key(key)

    if selection is None:
        raise HTTPException(status_code=404, detail="Avatar key not found")

    # Combine SVG components
    svg = combine_svg_components(selection)

    return AvatarResponse(key=key, svg=svg)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
