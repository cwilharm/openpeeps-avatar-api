# Avatar Generator API

A simple FastAPI application for building customizable profile picture avatars by combining face components.

## Features

- Generate bust-style avatar profile pictures
- Combine components: head/hair, face expression, body/clothing, facial hair, and accessories
- Compact hash-based keys for easy avatar retrieval
- Random avatar generation
- SVG output for scalable, high-quality images

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start the server:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Get Available Options
```
GET /options
```

Returns all available component options for each category.

**Response:**
```json
{
  "categories": {
    "head": [{"id": 0, "name": "Afro"}, ...],
    "face": [{"id": 0, "name": "Angry with Fang"}, ...],
    "body": [{"id": 0, "name": "Blazer Black Tee"}, ...],
    "facial-hair": [{"id": 0, "name": "* None"}, ...],
    "accessories": [{"id": 0, "name": "* None"}, ...]
  }
}
```

### 2. Generate Avatar with Specific Selection
```
POST /avatar/generate
Content-Type: application/json

{
  "head": 5,
  "face": 25,
  "body": 23,
  "facial_hair": 0,
  "accessories": 0
}
```

**Response:**
```json
{
  "key": "0e64267e",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"..."
}
```

### 3. Get Avatar by Key
```
GET /avatar/{key}
```

Retrieves a previously generated avatar using its key.

**Response:**
```json
{
  "key": "0e64267e",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"..."
}
```

### 4. Generate Random Avatar
```
GET /avatar/random
```

Generates a random avatar by randomly selecting components from each category.

**Response:**
```json
{
  "key": "7ce711ed",
  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\"..."
}
```

## Usage Examples

### Python
```python
import requests

# Get available options
response = requests.get('http://localhost:8000/options')
options = response.json()

# Generate avatar with specific selection
selection = {
    "head": 5,
    "face": 25,
    "body": 23,
    "facial_hair": 0,
    "accessories": 0
}
response = requests.post('http://localhost:8000/avatar/generate', json=selection)
avatar = response.json()

print(f"Avatar key: {avatar['key']}")
# Save SVG to file
with open(f"avatar_{avatar['key']}.svg", 'w') as f:
    f.write(avatar['svg'])

# Get random avatar
response = requests.get('http://localhost:8000/avatar/random')
random_avatar = response.json()
```

### JavaScript/Fetch
```javascript
// Get available options
const options = await fetch('http://localhost:8000/options').then(r => r.json());

// Generate avatar
const selection = {
  head: 5,
  face: 25,
  body: 23,
  facial_hair: 0,
  accessories: 0
};

const avatar = await fetch('http://localhost:8000/avatar/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(selection)
}).then(r => r.json());

// Display SVG in HTML
document.getElementById('avatar').innerHTML = avatar.svg;

// Get random avatar
const randomAvatar = await fetch('http://localhost:8000/avatar/random')
  .then(r => r.json());
```

### cURL
```bash
# Get options
curl http://localhost:8000/options

# Generate specific avatar
curl -X POST http://localhost:8000/avatar/generate \
  -H "Content-Type: application/json" \
  -d '{"head": 5, "face": 25, "body": 23, "facial_hair": 0, "accessories": 0}'

# Get avatar by key
curl http://localhost:8000/avatar/0e64267e

# Get random avatar
curl http://localhost:8000/avatar/random
```

## Component Categories

- **Head** (46 options): Various hairstyles, hats, and head coverings
- **Face** (30 options): Different facial expressions and emotions
- **Body** (30 options): Various clothing styles and poses
- **Facial Hair** (17 options): Beards, mustaches, and clean-shaven
- **Accessories** (9 options): Glasses, sunglasses, eyepatch, or none

## Technical Details

- **Framework**: FastAPI
- **Output Format**: SVG (Scalable Vector Graphics)
- **Image Dimensions**: 1136px × 1533px (bust portrait)
- **Key Format**: 8-character hash (e.g., "0e64267e")
- **CORS**: Enabled for all origins (customize in production)

## Frontend Integration

The API is designed for easy frontend integration:

1. Fetch options and display component selectors
2. Send user selection to generate endpoint
3. Display the returned SVG directly in your HTML
4. Save the key for later retrieval

Example HTML:
```html
<div id="avatar-container">
  <!-- SVG will be injected here -->
</div>

<script>
const response = await fetch('http://localhost:8000/avatar/random');
const avatar = await response.json();
document.getElementById('avatar-container').innerHTML = avatar.svg;
</script>
```

## Testing

Run the test suite:
```bash
python test_api.py
```

## Notes

- The in-memory key mapping is suitable for development. For production, use a database to persist avatar keys.
- SVG output can be directly embedded in HTML or saved as .svg files.
- The API uses CORS middleware to allow cross-origin requests.

## License

This project uses avatar components from the "Separate Atoms" collection.
