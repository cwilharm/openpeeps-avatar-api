/**
 * Avatar Builder Web Component with Stepper Navigation
 * Usage: <avatar-builder api-url="http://localhost:8000"></avatar-builder>
 */
class AvatarBuilder extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.apiUrl = this.getAttribute('api-url') || 'http://localhost:8000';
        this.selection = {
            head: 0,
            face: 0,
            body: 0,
            facial_hair: 0,
            accessories: 0
        };
        this.options = {};
        this.currentAvatar = null;
    }

    connectedCallback() {
        this.render();
        this.loadOptions();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    --accent: #ff90e8;
                    --pink: #ff90e8;
                    --purple: #90a8ed;
                    --green: #23a094;
                    --orange: #ffc900;
                    --red: #dc341e;
                    --yellow: #f1f333;
                    --body-bg: #f4f4f0;
                    --color: 0 0 0;
                    --filled: 255 255 255;
                    --contrast-accent: 0 0 0;
                    --text-sm: 0.875rem;
                    --text-base: 1rem;
                    --spacer-2: 0.5rem;
                    --spacer-3: 0.75rem;
                    --spacer-4: 1rem;
                    --border-radius-2: 0.5rem;
                    --border-radius-3: 10rem;
                    --box-shadow-1: 0.25rem 0.25rem 0 rgb(var(--color));
                    font-family: 'Satoshi', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    max-width: 380px;
                    background: rgb(var(--filled));
                    border-radius: var(--border-radius-2);
                    padding: var(--spacer-4);
                    border: 2px solid rgb(var(--color));
                    box-shadow: var(--box-shadow-1);
                }

                .avatar-preview {
                    width: 160px;
                    height: 216px;
                    margin: 0 auto var(--spacer-4);
                    background: var(--body-bg);
                    border-radius: var(--border-radius-2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid rgb(var(--color));
                    box-shadow: var(--box-shadow-1);
                    overflow: hidden;
                }

                .avatar-preview svg {
                    width: 100%;
                    height: 100%;
                }

                .avatar-preview.loading {
                    color: rgb(var(--color) / 0.4);
                    font-size: var(--text-sm);
                }

                .controls {
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacer-3);
                }

                .stepper {
                    background: var(--body-bg);
                    border-radius: var(--border-radius-2);
                    padding: var(--spacer-3);
                    border: 2px solid rgb(var(--color) / 0.1);
                }

                .stepper-label {
                    font-size: 0.75rem;
                    font-weight: 600;
                    color: rgb(var(--color) / 0.6);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    text-align: center;
                    margin-bottom: var(--spacer-2);
                }

                .stepper-control {
                    display: flex;
                    align-items: center;
                    gap: var(--spacer-2);
                }

                .stepper-btn {
                    width: 36px;
                    height: 36px;
                    border: 2px solid rgb(var(--color));
                    background: rgb(var(--filled));
                    border-radius: var(--border-radius-3);
                    cursor: pointer;
                    transition: all 150ms ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    color: rgb(var(--color));
                    flex-shrink: 0;
                    box-shadow: var(--box-shadow-1);
                }

                .stepper-btn:hover:not(:disabled) {
                    background: var(--accent);
                    color: rgb(var(--contrast-accent));
                    transform: translate(2px, 2px);
                    box-shadow: none;
                }

                .stepper-btn:disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .stepper-value {
                    flex: 1;
                    text-align: center;
                    font-size: var(--text-sm);
                    font-weight: 600;
                    color: rgb(var(--color));
                    padding: var(--spacer-2);
                    background: rgb(var(--filled));
                    border-radius: var(--border-radius-2);
                    border: 2px solid rgb(var(--color));
                    min-height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: opacity 150ms ease;
                }

                .stepper-value.updating {
                    opacity: 0.5;
                }

                .stepper-count {
                    font-size: 0.7rem;
                    color: rgb(var(--color) / 0.5);
                    text-align: center;
                    margin-top: var(--spacer-2);
                }

                .bottom-section {
                    margin-top: var(--spacer-3);
                    display: flex;
                    flex-direction: column;
                    gap: var(--spacer-2);
                }

                button.btn-random {
                    width: 100%;
                    padding: var(--spacer-2) var(--spacer-3);
                    border: 2px solid rgb(var(--color));
                    border-radius: var(--border-radius-2);
                    font-size: var(--text-sm);
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 150ms ease;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    font-family: 'Satoshi', sans-serif;
                    box-shadow: var(--box-shadow-1);
                    background: var(--purple);
                    color: rgb(var(--filled));
                }

                .btn-random:hover {
                    transform: translate(2px, 2px);
                    box-shadow: none;
                }

                .key-display {
                    text-align: center;
                    padding: var(--spacer-2);
                    background: var(--body-bg);
                    border-radius: var(--border-radius-2);
                    border: 2px solid rgb(var(--color) / 0.1);
                    font-size: 0.7rem;
                    color: rgb(var(--color));
                    font-family: monospace;
                    font-weight: 600;
                }

                .error {
                    background: var(--red);
                    color: rgb(var(--filled));
                    padding: var(--spacer-2);
                    border-radius: var(--border-radius-2);
                    border: 2px solid rgb(var(--color));
                    font-size: var(--text-sm);
                    margin-bottom: var(--spacer-3);
                    text-align: center;
                    box-shadow: var(--box-shadow-1);
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }

                .avatar-preview svg {
                    animation: fadeIn 0.2s ease-out;
                }
            </style>

            <div class="container">
                <div id="error" style="display: none;"></div>

                <div class="avatar-preview loading" id="preview">
                    <span>Loading...</span>
                </div>

                <div class="controls" id="controls"></div>

                <div class="bottom-section">
                    <button class="btn-random" id="randomBtn">Random</button>
                    <div class="key-display" id="keyDisplay">Key: -</div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const randomBtn = this.shadowRoot.getElementById('randomBtn');
        randomBtn.addEventListener('click', () => this.generateRandom());
    }

    async loadOptions() {
        try {
            const response = await fetch(`${this.apiUrl}/options`);
            const data = await response.json();
            this.options = data.categories;

            this.renderSteppers();
            this.generateAvatar();
        } catch (error) {
            this.showError('Failed to connect to API');
        }
    }

    renderSteppers() {
        const container = this.shadowRoot.getElementById('controls');

        const categories = {
            'head': 'Hair Style',
            'face': 'Face',
            'body': 'Body',
            'facial-hair': 'Facial Hair',
            'accessories': 'Accessories'
        };

        container.innerHTML = Object.entries(categories).map(([key, label]) => {
            const categoryKey = key.replace('-', '_');
            const categoryOptions = this.options[key];
            const currentIndex = this.selection[categoryKey];
            const currentOption = categoryOptions[currentIndex];
            const total = categoryOptions.length;

            return `
                <div class="stepper">
                    <div class="stepper-label">${label}</div>
                    <div class="stepper-control">
                        <button
                            class="stepper-btn"
                            data-category="${categoryKey}"
                            data-direction="prev"
                            ${currentIndex === 0 ? 'disabled' : ''}
                        >◀</button>
                        <div class="stepper-value" data-category="${categoryKey}">
                            ${currentOption.name}
                        </div>
                        <button
                            class="stepper-btn"
                            data-category="${categoryKey}"
                            data-direction="next"
                            ${currentIndex === total - 1 ? 'disabled' : ''}
                        >▶</button>
                    </div>
                    <div class="stepper-count">${currentIndex + 1} / ${total}</div>
                </div>
            `;
        }).join('');

        // Add click listeners
        container.querySelectorAll('.stepper-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                const direction = e.target.dataset.direction;
                this.stepOption(category, direction);
            });
        });
    }

    stepOption(category, direction) {
        const categoryKey = category.replace('_', '-');
        const options = this.options[categoryKey];
        const currentIndex = this.selection[category];

        let newIndex = currentIndex;
        if (direction === 'next' && currentIndex < options.length - 1) {
            newIndex = currentIndex + 1;
        } else if (direction === 'prev' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        }

        if (newIndex !== currentIndex) {
            this.selection[category] = newIndex;
            this.updateStepperDisplay(category);
            this.generateAvatar();
        }
    }

    updateStepperDisplay(category) {
        const categoryKey = category.replace('_', '-');
        const options = this.options[categoryKey];
        const currentIndex = this.selection[category];
        const currentOption = options[currentIndex];
        const total = options.length;

        // Update value display
        const valueDisplay = this.shadowRoot.querySelector(`.stepper-value[data-category="${category}"]`);
        if (valueDisplay) {
            valueDisplay.classList.add('updating');
            setTimeout(() => {
                valueDisplay.textContent = currentOption.name;
                valueDisplay.classList.remove('updating');
            }, 100);
        }

        // Update buttons
        const stepper = valueDisplay.closest('.stepper');
        const prevBtn = stepper.querySelector('[data-direction="prev"]');
        const nextBtn = stepper.querySelector('[data-direction="next"]');
        const count = stepper.querySelector('.stepper-count');

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === total - 1;
        count.textContent = `${currentIndex + 1} / ${total}`;
    }

    async generateAvatar() {
        try {
            const response = await fetch(`${this.apiUrl}/avatar/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.selection)
            });

            const data = await response.json();
            this.displayAvatar(data);
        } catch (error) {
            this.showError('Failed to generate avatar');
        }
    }

    async generateRandom() {
        // Generate random indices
        Object.keys(this.selection).forEach(category => {
            const categoryKey = category.replace('_', '-');
            const options = this.options[categoryKey];
            this.selection[category] = Math.floor(Math.random() * options.length);
        });

        // Update all steppers
        this.renderSteppers();

        // Generate avatar
        this.generateAvatar();
    }

    displayAvatar(data) {
        this.currentAvatar = data;
        const preview = this.shadowRoot.getElementById('preview');
        preview.classList.remove('loading');
        preview.innerHTML = data.svg;

        const keyDisplay = this.shadowRoot.getElementById('keyDisplay');
        keyDisplay.textContent = `Key: ${data.key}`;

        this.hideError();

        // Dispatch custom event
        this.dispatchEvent(new CustomEvent('avatar-generated', {
            detail: { key: data.key, svg: data.svg }
        }));
    }

    showError(message) {
        const errorDiv = this.shadowRoot.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.className = 'error';
        errorDiv.style.display = 'block';
    }

    hideError() {
        const errorDiv = this.shadowRoot.getElementById('error');
        errorDiv.style.display = 'none';
    }

    // Public API
    getAvatarKey() {
        return this.currentAvatar ? this.currentAvatar.key : null;
    }

    getAvatarSVG() {
        return this.currentAvatar ? this.currentAvatar.svg : null;
    }

    setSelection(selection) {
        this.selection = { ...this.selection, ...selection };
        this.renderSteppers();
        this.generateAvatar();
    }
}

// Register the custom element
customElements.define('avatar-builder', AvatarBuilder);
