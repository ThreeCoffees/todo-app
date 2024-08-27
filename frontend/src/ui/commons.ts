import { BaseHTMLElement, customElement, html } from "dom-native";

@customElement('c-ico')
class Ico extends BaseHTMLElement {
    init() {
        const name = this.getAttribute("name")?.trim();

        const htmlContent = html`<svg class="symbol">
        <use xlink:href="#${name}"></use>
        </svg>`;
        this.append(htmlContent)
    }
}
