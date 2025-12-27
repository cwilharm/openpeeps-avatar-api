# Avatar Builder Web Component

A lightweight, self-contained Web Component for creating customizable avatars.

## Features

- 📦 **Self-contained**: Single JavaScript file, no dependencies
- 🎯 **Simple**: Only 4 options per category for quick selection
- 🎨 **Customizable**: Easy to integrate and style
- 🚀 **Fast**: Lightweight and optimized
- 📱 **Responsive**: Works on all screen sizes
- 🔌 **Event-driven**: Custom events for easy integration

## Quick Start

### 1. Include the script

```html
<script src="avatar-builder.js"></script>
```

### 2. Use the component

```html
<avatar-builder api-url="http://localhost:8000"></avatar-builder>
```

### 3. Done! 🎉

The component will automatically load and display the avatar builder interface.

## API

### Attributes

- `api-url` (required): The base URL of your Avatar Generator API

### Events

#### `avatar-generated`

Fired when a new avatar is generated.

```javascript
const builder = document.querySelector('avatar-builder');

builder.addEventListener('avatar-generated', (event) => {
    console.log('Key:', event.detail.key);
    console.log('SVG:', event.detail.svg);
});
```

### Methods

#### `getAvatarKey()`

Returns the current avatar key.

```javascript
const key = builder.getAvatarKey();
console.log(key); // "0e64267e"
```

#### `getAvatarSVG()`

Returns the current avatar SVG string.

```javascript
const svg = builder.getAvatarSVG();
console.log(svg); // "<svg xmlns=..."
```

#### `setSelection(selection)`

Programmatically set the avatar selection.

```javascript
builder.setSelection({
    head: 2,
    face: 1,
    body: 3,
    facial_hair: 0,
    accessories: 1
});
```

## Styling

The component uses Shadow DOM for style encapsulation. To customize the appearance, you can modify the CSS in `avatar-builder.js`.

## Integration Examples

### React

```jsx
import { useEffect, useRef } from 'react';

function AvatarBuilderWrapper() {
    const builderRef = useRef(null);

    useEffect(() => {
        const builder = builderRef.current;

        const handleAvatarGenerated = (event) => {
            console.log('Avatar generated:', event.detail.key);
        };

        builder.addEventListener('avatar-generated', handleAvatarGenerated);

        return () => {
            builder.removeEventListener('avatar-generated', handleAvatarGenerated);
        };
    }, []);

    return (
        <avatar-builder
            ref={builderRef}
            api-url="http://localhost:8000"
        />
    );
}
```

### Vue

```vue
<template>
    <avatar-builder
        api-url="http://localhost:8000"
        @avatar-generated="handleAvatarGenerated"
    />
</template>

<script>
export default {
    methods: {
        handleAvatarGenerated(event) {
            console.log('Avatar generated:', event.detail.key);
        }
    }
}
</script>
```

### Vanilla JavaScript

```javascript
// Create dynamically
const builder = document.createElement('avatar-builder');
builder.setAttribute('api-url', 'http://localhost:8000');
document.body.appendChild(builder);

// Listen to events
builder.addEventListener('avatar-generated', (event) => {
    console.log('Avatar key:', event.detail.key);

    // Get the avatar data
    const key = builder.getAvatarKey();
    const svg = builder.getAvatarSVG();

    // Save to database or display elsewhere
    saveAvatar(key, svg);
});
```

## Browser Support

Works in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES6 Classes

## File Size

- **Uncompressed**: ~12 KB
- **Gzipped**: ~4 KB

## License

MIT
