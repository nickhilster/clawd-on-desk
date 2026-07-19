"use strict";

const fs = require("node:fs");
const path = require("node:path");

const OUT_DIR = path.join(__dirname, "..");

const C = {
  ink: "#211D36",
  fur: "#85869B",
  furLight: "#B9BBC8",
  cream: "#F8E9C7",
  mask: "#29253C",
  jacket: "#22C7C5",
  jacketDark: "#087D8F",
  violet: "#8B5CF6",
  violetDark: "#5B36B9",
  pink: "#FF4FB8",
  lime: "#C9FF57",
  amber: "#FFCC66",
  sky: "#67F5F2",
  red: "#FF647C",
  white: "#FFFDF5",
};

const VIEWBOX = "-20 -28 64 52";
const MINI_VIEWBOX = "-12 -12 48 48";

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function sharedDefs(extraCss = "") {
  return `
  <defs>
    <linearGradient id="jacket-gradient" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0" stop-color="${C.jacket}"/>
      <stop offset="0.52" stop-color="${C.jacketDark}"/>
      <stop offset="0.53" stop-color="${C.violet}"/>
      <stop offset="1" stop-color="${C.violetDark}"/>
    </linearGradient>
    <radialGradient id="aura-gradient">
      <stop offset="0" stop-color="${C.sky}" stop-opacity="0"/>
      <stop offset="0.55" stop-color="${C.violet}" stop-opacity=".16"/>
      <stop offset="1" stop-color="${C.pink}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation="1.15" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="small-glow" x="-80%" y="-80%" width="260%" height="260%">
      <feGaussianBlur stdDeviation=".45" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="tail-clip">
      <path d="M18 8 C29 5 31 14 25 18 C21 21 16 18 17 14 C18 12 21 12 23 13"/>
    </clipPath>
    <style>
      svg { overflow: visible; }
      .outline { stroke: ${C.ink}; stroke-width: .72; stroke-linecap: round; stroke-linejoin: round; }
      .thin { stroke: ${C.ink}; stroke-width: .48; stroke-linecap: round; stroke-linejoin: round; }
      .hb-bob { animation: hb-bob 2.8s infinite steps(1,end); transform-origin: 12px 12px; }
      .hb-tail { animation: hb-tail 2.8s infinite steps(1,end); transform-origin: 19px 12px; }
      .hb-blink { animation: hb-blink 5.2s infinite steps(1,end); transform-origin: 12px 0px; }
      .hb-aura { animation: hb-aura 3.2s infinite steps(8,end); transform-origin: 12px 6px; }
      .hb-pixel-a { animation: hb-pixel-a 1.6s infinite steps(1,end); }
      .hb-pixel-b { animation: hb-pixel-b 1.6s infinite steps(1,end); }
      .chat-pop { animation: chat-pop 10.8s infinite steps(1,end); transform-origin: 17px -12px; }
      .chat-pulse { animation: chat-pulse 1.2s infinite steps(2,end); }
      @keyframes hb-bob {
        0%, 15%, 54%, 100% { transform: translateY(0) scale(1); }
        16%, 18% { transform: translateY(1px) scale(1.03,.97); }
        19%, 21% { transform: translateY(-2px) scale(.98,1.03); }
        22%, 53% { transform: translateY(-.45px); }
      }
      @keyframes hb-tail {
        0%, 18%, 52%, 100% { transform: rotate(-4deg); }
        19%, 21% { transform: rotate(14deg); }
        22%, 51% { transform: rotate(5deg); }
      }
      @keyframes hb-blink {
        0%, 68%, 72%, 94%, 98%, 100% { transform: scaleY(1); }
        69%, 71%, 95%, 97% { transform: scaleY(.08); }
      }
      @keyframes hb-aura {
        to { transform: rotate(360deg); }
      }
      @keyframes hb-pixel-a { 0%,49% { opacity:.95 } 50%,100% { opacity:.18 } }
      @keyframes hb-pixel-b { 0%,49% { opacity:.2 } 50%,100% { opacity:1 } }
      @keyframes chat-pop {
        0%, 11%, 86%, 100% { opacity:0; transform:scale(.4) translateY(2px); }
        12%, 14% { opacity:1; transform:scale(1.09) translateY(0); }
        15%, 82% { opacity:1; transform:scale(1); }
        83%, 85% { opacity:1; transform:scale(.94); }
      }
      @keyframes chat-pulse { 0%,49% { opacity:1 } 50%,100% { opacity:.45 } }
      ${extraCss}
    </style>
  </defs>`;
}

function aura(options = {}) {
  const { dense = false, calm = false } = options;
  const opacity = calm ? ".25" : ".55";
  return `
  <g class="hb-aura" opacity="${opacity}" filter="url(#small-glow)">
    <circle cx="12" cy="6" r="${dense ? 18 : 16}" fill="none" stroke="${C.violet}" stroke-width=".55" stroke-dasharray="1.5 3.2"/>
    <circle cx="12" cy="6" r="${dense ? 14 : 12.5}" fill="none" stroke="${C.sky}" stroke-width=".48" stroke-dasharray="5 2.5"/>
    <path d="M-5 6 C2 -5 7 17 14 5 S27 -4 31 8" fill="none" stroke="${C.pink}" stroke-width=".65" stroke-dasharray="2 2.2"/>
  </g>
  <g filter="url(#small-glow)">
    <rect class="hb-pixel-a" x="-1" y="-5" width="1.2" height="1.2" fill="${C.lime}"/>
    <rect class="hb-pixel-b" x="27" y="-1" width="1.1" height="1.1" fill="${C.pink}"/>
    <path class="hb-pixel-a" d="M30 12 h3 M31.5 10.5 v3" stroke="${C.sky}" stroke-width=".8"/>
    <path class="hb-pixel-b" d="M-3 12 h3 M-1.5 10.5 v3" stroke="${C.violet}" stroke-width=".8"/>
  </g>`;
}

function speechBubble(lines, options = {}) {
  const {
    x = 14,
    y = -25,
    width = 27,
    className = "chat-pop",
    accent = C.pink,
  } = options;
  const safeLines = Array.isArray(lines) ? lines : [lines];
  const text = safeLines.map((line, i) =>
    `<text x="${x + width / 2}" y="${y + 4.2 + i * 3.5}" text-anchor="middle" font-family="monospace" font-size="${safeLines.length > 1 ? 2.5 : 2.85}" font-weight="900" fill="${C.ink}">${esc(line)}</text>`
  ).join("");
  const height = safeLines.length > 1 ? 10 : 7;
  return `
  <g class="${className}" filter="url(#small-glow)">
    <path d="M${x + 6} ${y + height - .2} L${x + 3.8} ${y + height + 2.4} L${x + 10} ${y + height - .2}" fill="${C.white}" stroke="${C.ink}" stroke-width=".62" stroke-linejoin="round"/>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" rx="2.4" fill="${C.white}" stroke="${C.ink}" stroke-width=".68"/>
    <rect x="${x + 1.1}" y="${y + 1}" width="1.1" height="${height - 2}" rx=".5" fill="${accent}"/>
    ${text}
    <rect class="chat-pulse" x="${x + width - 2.3}" y="${y + height - 2.1}" width=".85" height=".85" fill="${accent}"/>
  </g>`;
}

function faceExpression(type = "smile") {
  const brows = {
    smile: `<path d="M6.4 -2.4 Q8 -3.2 9.4 -2.5 M14.6 -2.5 Q16 -3.2 17.6 -2.4" fill="none" class="thin"/>`,
    think: `<path d="M6.2 -3 Q8 -4 9.5 -3.1 M14.4 -2.1 Q16.1 -2.6 17.8 -2" fill="none" class="thin"/>`,
    happy: `<path d="M6.4 -2 Q8 -3.6 9.6 -2 M14.3 -2 Q16 -3.6 17.8 -2" fill="none" class="thin"/>`,
    worry: `<path d="M6.2 -2.4 Q8 -1.2 9.5 -2.1 M14.4 -2.1 Q16 -1.2 17.8 -2.4" fill="none" class="thin"/>`,
    annoyed: `<path d="M6.2 -3.2 L9.6 -2.2 M14.4 -2.2 L17.8 -3.2" fill="none" class="thin"/>`,
    surprise: `<path d="M6.3 -3.6 Q8 -4.2 9.6 -3.5 M14.4 -3.5 Q16 -4.2 17.7 -3.6" fill="none" class="thin"/>`,
  }[type] || "";

  if (type === "sleep" || type === "doze") {
    return `
      <g>${brows}</g>
      <path d="M6.7 .1 Q8.2 1.2 9.7 .1 M14.3 .1 Q15.8 1.2 17.3 .1" fill="none" stroke="${C.ink}" stroke-width=".8" stroke-linecap="round"/>
      <path d="M10.6 4.6 Q12 5.4 13.4 4.6" fill="none" stroke="${C.ink}" stroke-width=".58" stroke-linecap="round"/>`;
  }

  if (type === "dizzy") {
    return `
      <g>${brows}</g>
      <g id="eyes-js" fill="none" stroke="${C.amber}" stroke-width=".7">
        <path d="M8 1 c-2 -2 -3 2 -.7 2.2 c2.4 .2 2.6 -3 .2 -3.7"/>
        <path d="M16 1 c2 -2 3 2 .7 2.2 c-2.4 .2 -2.6 -3 -.2 -3.7"/>
      </g>
      <path d="M10.3 4.6 Q12 3.4 13.7 4.6" fill="none" stroke="${C.ink}" stroke-width=".65"/>`;
  }

  const pupilShift = type === "think" ? `transform="translate(1 -.2)"` : "";
  const mouth = {
    smile: `<path d="M9.6 4.2 Q12 6 14.4 4.2" fill="none" stroke="${C.ink}" stroke-width=".7" stroke-linecap="round"/>`,
    think: `<path d="M10.2 4.8 Q12 4.1 13.8 4.8" fill="none" stroke="${C.ink}" stroke-width=".65" stroke-linecap="round"/>`,
    happy: `<path d="M9.5 4.1 Q12 7 14.5 4.1 Q12 8.2 9.5 4.1" fill="${C.pink}" stroke="${C.ink}" stroke-width=".58"/>`,
    worry: `<path d="M9.8 5.4 Q12 3.4 14.2 5.4" fill="none" stroke="${C.ink}" stroke-width=".7" stroke-linecap="round"/>`,
    annoyed: `<path d="M10 5.1 L14 5.1" fill="none" stroke="${C.ink}" stroke-width=".68" stroke-linecap="round"/>`,
    surprise: `<ellipse cx="12" cy="4.9" rx="1.35" ry="1.6" fill="${C.ink}"/>`,
  }[type] || "";

  return `
    <g>${brows}</g>
    <g id="eyes-js" class="hb-blink">
      <ellipse cx="8" cy=".5" rx="2.15" ry="2.5" fill="${C.white}" stroke="${C.ink}" stroke-width=".52"/>
      <ellipse cx="16" cy=".5" rx="2.15" ry="2.5" fill="${C.white}" stroke="${C.ink}" stroke-width=".52"/>
      <g ${pupilShift}>
        <ellipse cx="8.25" cy=".8" rx=".92" ry="1.25" fill="${C.ink}"/>
        <ellipse cx="16.25" cy=".8" rx=".92" ry="1.25" fill="${C.ink}"/>
        <circle cx="8.55" cy=".25" r=".34" fill="${C.white}"/>
        <circle cx="16.55" cy=".25" r=".34" fill="${C.white}"/>
      </g>
    </g>
    ${mouth}`;
}

function raccoon(options = {}) {
  const {
    expression = "smile",
    bodyClass = "hb-bob",
    bodyTransform = "",
    tailClass = "hb-tail",
    leftHand = [-.5, 8],
    rightHand = [24.5, 8],
    headTilt = 0,
    extraBehind = "",
    extraFront = "",
    eyeTrackIds = true,
  } = options;
  const bodyId = eyeTrackIds ? ` id="body-js"` : "";
  return `
  <ellipse id="shadow-js" cx="12" cy="19.2" rx="9.2" ry="1.65" fill="${C.ink}" opacity=".18"/>
  ${extraBehind}
  <g class="${tailClass}" style="transform-origin:19px 12px">
    <path d="M18 8 C29 5 31 14 25 18 C21 21 16 18 17 14 C18 12 21 12 23 13" fill="${C.fur}" class="outline"/>
    <g clip-path="url(#tail-clip)" fill="${C.mask}" opacity=".92">
      <path d="M21 5 L24 6 L21 21 L18 20 Z"/>
      <path d="M27 7 L30 10 L25 20 L22 18 Z"/>
    </g>
    <path d="M18 8 C29 5 31 14 25 18 C21 21 16 18 17 14 C18 12 21 12 23 13" fill="none" class="outline"/>
  </g>
  <g${bodyId} class="${bodyClass}" transform="${bodyTransform}" style="transform-origin:12px 11px">
    <ellipse cx="6.2" cy="18.1" rx="3.8" ry="1.8" fill="${C.mask}" class="outline"/>
    <ellipse cx="17.8" cy="18.1" rx="3.8" ry="1.8" fill="${C.mask}" class="outline"/>
    <path d="M5 6 Q1.8 6.8 ${leftHand[0]} ${leftHand[1]}" fill="none" stroke="${C.jacketDark}" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M19 6 Q22.2 6.8 ${rightHand[0]} ${rightHand[1]}" fill="none" stroke="${C.violetDark}" stroke-width="3.6" stroke-linecap="round"/>
    <circle cx="${leftHand[0]}" cy="${leftHand[1]}" r="1.45" fill="${C.mask}" class="outline"/>
    <circle cx="${rightHand[0]}" cy="${rightHand[1]}" r="1.45" fill="${C.mask}" class="outline"/>
    <path d="M4.6 5.5 Q3.2 10.8 5.6 16.5 Q12 19 18.4 16.5 Q20.8 10.8 19.4 5.5 Z" fill="url(#jacket-gradient)" class="outline"/>
    <path d="M12 6 V17.2" stroke="${C.amber}" stroke-width=".75"/>
    <path d="M5.6 8.7 H18.4" stroke="${C.sky}" stroke-width=".45" opacity=".75"/>
    <path d="M7.3 14.5 Q12 16 16.7 14.5" fill="none" stroke="${C.ink}" stroke-width=".5" opacity=".75"/>
    <path d="M6.2 5.2 Q12 1.7 17.8 5.2" fill="none" stroke="${C.violet}" stroke-width="2.2"/>
    <path d="M7 5 L17 16.6" stroke="${C.ink}" stroke-width="1.05" opacity=".86"/>
    <rect x="15.1" y="12.2" width="4.7" height="4.5" rx=".8" fill="${C.violetDark}" class="outline"/>
    <path d="M16 12.2 Q17.5 10.7 19 12.2" fill="none" class="thin"/>
    <path d="M17.25 13.1 l.55 1.05 1.15 .18 -.84 .82 .2 1.15 -1.06-.55 -1.02 .55 .18-1.15 -.82-.82 1.14-.18z" fill="${C.lime}"/>
    <g transform="rotate(${headTilt} 12 0)">
      <path d="M4 -4 L4.7 -10 L9 -6.7 M20 -4 L19.3 -10 L15 -6.7" fill="${C.fur}" class="outline"/>
      <path d="M5.3 -5.5 L5.7 -8.2 L7.8 -6.4 M18.7 -5.5 L18.3 -8.2 L16.2 -6.4" fill="${C.cream}" opacity=".9"/>
      <path d="M3.4 -3.8 Q3.7 -8 12 -8.7 Q20.3 -8 20.6 -3.8 L21.4 -.8 L20.2 .1 L21.2 2.3 L19.8 2.6 L20.1 5.8 Q17.2 9.1 12 9.6 Q6.8 9.1 3.9 5.8 L4.2 2.6 L2.8 2.3 L3.8 .1 L2.6 -.8 Z" fill="${C.furLight}" class="outline"/>
      <path d="M3.9 -2.1 Q7 -5.6 11 -2.6 L9.6 3.3 Q6.3 4.2 4.2 2.1 Z" fill="${C.mask}"/>
      <path d="M20.1 -2.1 Q17 -5.6 13 -2.6 L14.4 3.3 Q17.7 4.2 19.8 2.1 Z" fill="${C.mask}"/>
      <path d="M8.1 3.2 Q12 .8 15.9 3.2 L15 7 Q12 8.2 9 7 Z" fill="${C.cream}"/>
      <path d="M10.6 3.1 Q12 2.3 13.4 3.1 Q12 4.5 10.6 3.1" fill="${C.ink}"/>
      ${faceExpression(expression)}
      <path d="M4.6 -5.1 Q6.2 -7 8 -7.2 M16 -7.2 Q17.8 -7 19.4 -5.1" fill="none" stroke="${C.white}" stroke-width=".8" opacity=".8"/>
    </g>
    <g filter="url(#small-glow)">
      <rect x="-1.9" y="${leftHand[1] - 1.8}" width="2.9" height=".55" rx=".25" fill="${C.lime}" transform="rotate(-8 -1 ${leftHand[1]})"/>
      <rect x="23" y="${rightHand[1] - 1.8}" width="2.9" height=".55" rx=".25" fill="${C.pink}" transform="rotate(8 24 ${rightHand[1]})"/>
    </g>
    ${extraFront}
  </g>`;
}

function svg(content, options = {}) {
  const {
    css = "",
    mini = false,
    title = "Riff the Rave Raccoon",
  } = options;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mini ? MINI_VIEWBOX : VIEWBOX}" role="img" aria-label="${esc(title)}">
  <title>${esc(title)}</title>
  ${sharedDefs(css)}
  ${content}
</svg>
`;
}

function mapProp() {
  return `
  <g class="map-snap" filter="url(#small-glow)">
    <path d="M-6 -14 L2 -16 L9 -13 L16 -16 L24 -13 L24 -2 L16 -5 L9 -2 L2 -5 L-6 -3 Z" fill="${C.sky}" fill-opacity=".18" stroke="${C.sky}" stroke-width=".65"/>
    <path d="M2 -16 V-5 M9 -13 V-2 M16 -16 V-5" stroke="${C.violet}" stroke-width=".48"/>
    <path d="M-3 -11 C2 -7 7 -14 12 -9 S19 -8 21 -11" fill="none" stroke="${C.pink}" stroke-width=".75" stroke-dasharray="1.2 1.2"/>
    <circle cx="20.5" cy="-11" r="1.2" fill="${C.lime}"/>
    <path d="M20.5 -12.7 Q23 -11 20.5 -8.7 Q18 -11 20.5 -12.7" fill="none" stroke="${C.lime}" stroke-width=".55"/>
  </g>`;
}

function deckProp() {
  return `
  <g class="deck-jump" transform="translate(1 11)" filter="url(#small-glow)">
    <path d="M0 0 H22 L20.5 7 H1.5 Z" fill="${C.ink}" stroke="${C.sky}" stroke-width=".7"/>
    <circle cx="5.2" cy="3.2" r="2" fill="${C.violetDark}" stroke="${C.pink}" stroke-width=".55"/>
    <circle cx="16.8" cy="3.2" r="2" fill="${C.jacketDark}" stroke="${C.lime}" stroke-width=".55"/>
    <g fill="${C.sky}"><rect x="9" y="1.4" width="1.4" height="1.4"/><rect x="11" y="1.4" width="1.4" height="1.4"/></g>
    <g fill="${C.pink}"><rect x="9" y="3.5" width="1.4" height="1.4"/><rect x="11" y="3.5" width="1.4" height="1.4"/></g>
  </g>`;
}

function orbSet(count = 3) {
  const coords = count > 3
    ? [[-2, 2], [4, -7], [12, -12], [20, -7], [26, 2]]
    : [[1, -5], [12, -12], [23, -5]];
  return `<g class="orb-loop" filter="url(#soft-glow)">${coords.map(([x, y], i) =>
    `<circle cx="${x}" cy="${y}" r="${i % 2 ? 1.7 : 1.35}" fill="${[C.sky, C.pink, C.lime][i % 3]}" stroke="${C.white}" stroke-width=".35"/>`
  ).join("")}</g>`;
}

function portalProp() {
  return `
  <g class="portal-snap" transform="translate(28 -8)" filter="url(#soft-glow)">
    <path d="M0 0 L8 -4 L14 1 L12 11 L4 14 L-2 8 Z" fill="${C.violet}" fill-opacity=".18" stroke="${C.sky}" stroke-width="1"/>
    <path d="M3 2 L8 0 L11 3 L10 8 L6 10 L2 7 Z" fill="none" stroke="${C.pink}" stroke-width=".75"/>
    <path d="M5 4 h3 v3 H5z" fill="${C.lime}"/>
  </g>`;
}

function normalAssets() {
  const files = {};
  files["riff-idle.svg"] = svg(
    `${aura({ calm: true })}${raccoon({ expression: "smile" })}`,
    { title: "Riff watches the cursor with bright, curious eyes" }
  );

  files["riff-idle-sidequest.svg"] = svg(
    `${aura()}${raccoon({ expression: "smile", rightHand: [25.5, 1.2] })}${speechBubble("SIDE QUEST?")}`,
    { title: "Riff asks if there is a side quest" }
  );

  files["riff-idle-map.svg"] = svg(
    `${aura({ calm: true })}${mapProp()}${raccoon({ expression: "think", headTilt: 8, leftHand: [3, 7], rightHand: [21, 6] })}`,
    {
      title: "Riff studies a glowing city map",
      css: `
        .map-snap { animation: map-snap 6.2s infinite steps(1,end); transform-origin:9px -7px; }
        @keyframes map-snap { 0%,12%,88%,100%{transform:translateY(3px) scale(.7);opacity:0} 13%,16%{transform:translateY(-1px) scale(1.06);opacity:1} 17%,87%{transform:none;opacity:1} }
      `,
    }
  );

  files["riff-idle-dance.svg"] = svg(
    `${aura({ dense: true })}${raccoon({ expression: "happy", bodyClass: "dance", leftHand: [-1, 1], rightHand: [25, 1] })}`,
    {
      title: "Riff breaks into a tiny rave dance",
      css: `
        .dance { animation:dance 1.25s infinite steps(1,end); transform-origin:12px 16px; }
        @keyframes dance { 0%,24%{transform:rotate(-7deg) translate(-1px,0)} 25%,49%{transform:rotate(7deg) translate(1px,-2px)} 50%,74%{transform:rotate(-4deg) translate(-1px,-1px)} 75%,100%{transform:rotate(5deg) translate(1px,0)} }
      `,
    }
  );

  files["riff-thinking.svg"] = svg(
    `${aura({ dense: true })}${mapProp()}${raccoon({ expression: "think", headTilt: 10, leftHand: [8, 5], rightHand: [21.5, 7] })}${speechBubble("PLOT TWIST...", { className: "chat-pop" })}`,
    {
      title: "Riff thinks through a glowing route",
      css: `
        .map-snap { animation:think-map 4.8s infinite steps(1,end); transform-origin:9px -7px; }
        @keyframes think-map { 0%,12%{transform:scale(.8);opacity:.25} 13%,16%{transform:scale(1.08);opacity:1} 17%,82%{transform:none;opacity:1} 83%,100%{transform:scale(.94);opacity:.55} }
      `,
    }
  );

  files["riff-working-mix.svg"] = svg(
    `${aura({ dense: true })}${raccoon({ expression: "smile", bodyClass: "work-nod", leftHand: [6, 13], rightHand: [18, 13] })}${deckProp()}${speechBubble("IN THE FLOW", { x: 17, width: 24, accent: C.sky })}`,
    {
      title: "Riff mixes commands on a pocket sampler",
      css: `
        .work-nod { animation:work-nod 1.6s infinite steps(1,end);transform-origin:12px 12px}
        .deck-jump { animation:deck-jump .8s infinite steps(1,end);transform-origin:12px 15px}
        @keyframes work-nod {0%,44%{transform:translateY(0)}45%,54%{transform:translateY(1.2px) scale(1.02,.98)}55%,100%{transform:translateY(-.6px)}}
        @keyframes deck-jump {0%,49%{transform:translate(1px,11px)}50%,100%{transform:translate(1px,10.5px)}}
      `,
    }
  );

  files["riff-working-rave.svg"] = svg(
    `${aura({ dense: true })}<g class="music" filter="url(#soft-glow)"><path d="M-2 -9 v-5 h3 v3 h-2" fill="none" stroke="${C.pink}" stroke-width="1"/><path d="M28 -11 v-5 h4 v3 h-3" fill="none" stroke="${C.lime}" stroke-width="1"/></g>${raccoon({ expression: "happy", bodyClass: "rave-step", leftHand: [0, 2], rightHand: [24, 2], extraFront: `<path d="M3 -3 Q12 -13 21 -3" fill="none" stroke="${C.ink}" stroke-width="2.2"/><circle cx="3" cy="-2" r="2.8" fill="${C.violet}" class="outline"/><circle cx="21" cy="-2" r="2.8" fill="${C.jacket}" class="outline"/>` })}`,
    {
      title: "Riff grooves in headphones while two sessions run",
      css: `
        .rave-step {animation:rave-step 1.1s infinite steps(1,end);transform-origin:12px 17px}
        .music {animation:music .55s infinite steps(1,end)}
        @keyframes rave-step {0%,24%{transform:rotate(-5deg) translateX(-1px)}25%,49%{transform:rotate(5deg) translate(1px,-1px)}50%,74%{transform:rotate(-3deg) translate(-.5px,-2px)}75%,100%{transform:rotate(4deg) translateX(1px)}}
        @keyframes music {0%,49%{opacity:.25;transform:translateY(1px)}50%,100%{opacity:1;transform:translateY(-1px)}}
      `,
    }
  );

  files["riff-working-portal.svg"] = svg(
    `${aura({ dense: true })}${portalProp()}${raccoon({ expression: "surprise", bodyClass: "portal-lean", leftHand: [23, 4], rightHand: [28, 0] })}${speechBubble(["NEW", "SHORTCUT!"], { x: 17, width: 22, accent: C.lime })}`,
    {
      title: "Riff opens a psychedelic code portal",
      css: `
        .portal-snap {animation:portal 2.2s infinite steps(1,end);transform-origin:34px 1px}
        .portal-lean {animation:lean 2.2s infinite steps(1,end);transform-origin:12px 16px}
        @keyframes portal {0%,15%{transform:translate(28px,-8px) scale(.25);opacity:.1}16%,22%{transform:translate(28px,-8px) scale(1.2);opacity:1}23%,78%{transform:translate(28px,-8px) scale(1);opacity:1}79%,100%{transform:translate(28px,-8px) scale(.9);opacity:.6}}
        @keyframes lean {0%,15%{transform:rotate(0)}16%,22%{transform:rotate(8deg) translateX(2px)}23%,100%{transform:rotate(5deg) translateX(1px)}}
      `,
    }
  );

  files["riff-juggling.svg"] = svg(
    `${aura({ dense: true })}${orbSet(3)}${raccoon({ expression: "happy", bodyClass: "juggle-bounce", leftHand: [1, 2], rightHand: [23, 2] })}`,
    {
      title: "Riff juggles three glowing side quests",
      css: `
        .orb-loop {animation:orb-loop 1.5s infinite steps(6,end);transform-origin:12px -2px}
        .juggle-bounce {animation:juggle-bounce 1.5s infinite steps(1,end);transform-origin:12px 17px}
        @keyframes orb-loop {to{transform:rotate(360deg)}}
        @keyframes juggle-bounce {0%,32%,66%,100%{transform:translateY(0)}33%,38%{transform:translateY(-2px) scale(.98,1.03)}39%,65%{transform:translateY(-.4px)}}
      `,
    }
  );

  files["riff-conducting.svg"] = svg(
    `${aura({ dense: true })}${orbSet(5)}${raccoon({ expression: "surprise", bodyClass: "conduct", leftHand: [-3, -1], rightHand: [27, -2] })}${speechBubble("CREW, GO!", { x: 17, width: 23, accent: C.lime })}`,
    {
      title: "Riff conducts a swarm of glowing subagents",
      css: `
        .orb-loop {animation:orb-loop 2s infinite steps(8,end);transform-origin:12px -2px}
        .conduct {animation:conduct 2s infinite steps(1,end);transform-origin:12px 17px}
        @keyframes orb-loop {to{transform:rotate(360deg)}}
        @keyframes conduct {0%,22%{transform:rotate(-6deg)}23%,26%{transform:rotate(7deg) translateY(-2px)}27%,61%{transform:rotate(3deg)}62%,65%{transform:rotate(-8deg) translateY(-1px)}66%,100%{transform:rotate(-2deg)}}
      `,
    }
  );

  files["riff-happy.svg"] = svg(
    `${aura({ dense: true })}<g class="confetti" filter="url(#small-glow)"><path d="M-4 -8 l2 2 M1 -14 v3 M27 -12 l-2 3 M32 -5 h-3" stroke="${C.lime}" stroke-width="1.2"/><rect x="4" y="-18" width="1.5" height="1.5" fill="${C.pink}"/><rect x="23" y="-17" width="1.5" height="1.5" fill="${C.sky}"/></g>${raccoon({ expression: "happy", bodyClass: "victory", leftHand: [-2, -3], rightHand: [26, -3] })}${speechBubble("NICE!", { accent: C.lime })}`,
    {
      title: "Riff leaps into a joyful completion dance",
      css: `
        .victory {animation:victory 1.4s infinite steps(1,end);transform-origin:12px 18px}
        .confetti {animation:confetti 1.4s infinite steps(4,end)}
        @keyframes victory {0%,18%,72%,100%{transform:translateY(0) scale(1)}19%,23%{transform:translateY(1px) scale(1.08,.92)}24%,36%{transform:translateY(-5px) scale(.96,1.05)}37%,71%{transform:translateY(-1px)}}
        @keyframes confetti {to{transform:translateY(8px);opacity:.15}}
      `,
    }
  );

  files["riff-notification.svg"] = svg(
    `${aura({ dense: true })}<g class="alert-ring" filter="url(#soft-glow)"><circle cx="12" cy="3" r="15" fill="none" stroke="${C.amber}" stroke-width="1.2"/><circle cx="12" cy="3" r="18" fill="none" stroke="${C.pink}" stroke-width=".7"/></g>${raccoon({ expression: "surprise", bodyClass: "alert", leftHand: [-2, 0], rightHand: [26, 0] })}${speechBubble("YO?", { accent: C.amber })}`,
    {
      title: "Riff pops up with an alert",
      css: `
        .alert {animation:alert 1.3s infinite steps(1,end);transform-origin:12px 18px}
        .alert-ring {animation:ring 1.3s infinite steps(3,end);transform-origin:12px 3px}
        @keyframes alert {0%,18%,72%,100%{transform:none}19%,24%{transform:translateY(-4px) scale(.94,1.08)}25%,71%{transform:translateY(-1px)}}
        @keyframes ring {0%{transform:scale(.5);opacity:1}100%{transform:scale(1.25);opacity:0}}
      `,
    }
  );

  files["riff-error.svg"] = svg(
    `<g class="glitch" filter="url(#soft-glow)"><path d="M-5 -5 H4 M20 -12 H31 M-2 10 H5 M22 6 H35" stroke="${C.red}" stroke-width="1.3"/><path d="M0 -14 h3 v3 H0z M28 -3 h2 v2 h-2z" fill="${C.pink}"/></g>${raccoon({ expression: "worry", bodyClass: "error-shake", leftHand: [1, 2], rightHand: [23, 2] })}${speechBubble("UH-OH", { accent: C.red })}`,
    {
      title: "Riff is startled by an error but stays brave",
      css: `
        .error-shake {animation:error-shake .72s infinite steps(1,end);transform-origin:12px 17px}
        .glitch {animation:glitch .72s infinite steps(1,end)}
        @keyframes error-shake {0%,24%{transform:translateX(-1px) rotate(-2deg)}25%,49%{transform:translateX(1.5px) rotate(2deg)}50%,74%{transform:translateX(-.5px)}75%,100%{transform:translateX(1px)}}
        @keyframes glitch {0%,49%{transform:translateX(-1px);opacity:.45}50%,100%{transform:translateX(1px);opacity:1}}
      `,
    }
  );

  files["riff-sweeping.svg"] = svg(
    `${aura({ calm: true })}<g class="pixel-stream" filter="url(#small-glow)"><rect x="-8" y="10" width="2" height="2" fill="${C.sky}"/><rect x="-4" y="13" width="1.4" height="1.4" fill="${C.pink}"/><rect x="0" y="9" width="1.7" height="1.7" fill="${C.lime}"/><path d="M-8 15 C-2 13 3 13 8 15" fill="none" stroke="${C.violet}" stroke-width=".8" stroke-dasharray="1 1"/></g>${raccoon({ expression: "smile", bodyClass: "sweep-lean", leftHand: [3, 11], rightHand: [8, 13], extraFront: `<path d="M7 12 L-5 1" stroke="${C.amber}" stroke-width="1.1"/><path d="M-8 -1 L-2 4 L-7 7 Z" fill="${C.pink}" class="outline"/>` })}`,
    {
      title: "Riff sweeps loose context pixels into the satchel",
      css: `
        .sweep-lean {animation:sweep 1.8s infinite steps(1,end);transform-origin:12px 18px}
        .pixel-stream {animation:pixels 1.8s infinite steps(4,end)}
        @keyframes sweep {0%,22%{transform:rotate(-5deg) translateX(-1px)}23%,29%{transform:rotate(8deg) translateX(2px)}30%,65%{transform:rotate(4deg)}66%,72%{transform:rotate(-7deg) translateX(-1px)}73%,100%{transform:rotate(-3deg)}}
        @keyframes pixels {to{transform:translate(12px,2px);opacity:.15}}
      `,
    }
  );

  files["riff-carrying.svg"] = svg(
    `${aura()}<g class="treasure" filter="url(#soft-glow)"><circle cx="30" cy="7" r="4.2" fill="${C.amber}" stroke="${C.ink}" stroke-width=".7"/><path d="M30 4.3 l.8 1.8 2 .2 -1.5 1.4 .5 2 -1.8-1 -1.8 1 .5-2 -1.5-1.4 2-.2z" fill="${C.pink}"/></g>${raccoon({ expression: "happy", bodyClass: "carry-proud", leftHand: [22, 7], rightHand: [28, 7] })}${speechBubble("FOUND IT!", { x: 16, width: 24, accent: C.amber })}`,
    {
      title: "Riff proudly returns with a shiny discovered treasure",
      css: `
        .treasure {animation:treasure 2s infinite steps(1,end);transform-origin:30px 7px}
        .carry-proud {animation:proud 2s infinite steps(1,end);transform-origin:12px 18px}
        @keyframes treasure {0%,18%{transform:scale(.75);opacity:.45}19%,24%{transform:scale(1.18);opacity:1}25%,100%{transform:scale(1)}}
        @keyframes proud {0%,18%,100%{transform:none}19%,24%{transform:translateY(-2px) rotate(4deg)}25%,74%{transform:rotate(2deg)}75%,100%{transform:none}}
      `,
    }
  );

  return files;
}

function sleepAssets() {
  return {
    "riff-yawning.svg": svg(
      `${aura({ calm: true })}${raccoon({ expression: "surprise", bodyClass: "yawn", leftHand: [8.5, 4.5], rightHand: [25, 3] })}<g class="yawn-puff" filter="url(#small-glow)"><circle cx="25" cy="1" r="1" fill="${C.sky}" opacity=".5"/><circle cx="29" cy="-2" r="1.5" fill="${C.violet}" opacity=".4"/></g>`,
      {
        title: "Riff gives a huge sleepy yawn",
        css: `
          .yawn {animation:yawn 3.2s infinite steps(1,end);transform-origin:12px 18px}
          .yawn-puff {animation:puff 3.2s infinite steps(4,end)}
          @keyframes yawn {0%,15%{transform:none}16%,24%{transform:scale(1.02,.94) translateY(1px)}25%,68%{transform:scale(.98,1.04) translateY(-1px)}69%,100%{transform:none}}
          @keyframes puff {0%,25%{opacity:0}26%,100%{transform:translate(4px,-4px);opacity:.8}}
        `,
      }
    ),
    "riff-dozing.svg": svg(
      `${aura({ calm: true })}${raccoon({ expression: "doze", bodyClass: "doze", headTilt: -8, leftHand: [2, 11], rightHand: [22, 11] })}<text class="zzz" x="24" y="-8" fill="${C.sky}" font-family="monospace" font-size="4" font-weight="900">z</text>`,
      {
        title: "Riff nods off between adventures",
        css: `
          .doze {animation:doze 3.8s infinite steps(1,end);transform-origin:12px 18px}
          .zzz {animation:zzz 3.8s infinite steps(4,end)}
          @keyframes doze {0%,28%{transform:rotate(-3deg)}29%,35%{transform:rotate(8deg) translateY(2px)}36%,74%{transform:rotate(5deg) translateY(1px)}75%,82%{transform:rotate(-5deg) translateY(-1px)}83%,100%{transform:rotate(-3deg)}}
          @keyframes zzz {0%{transform:translate(0,4px);opacity:0}100%{transform:translate(7px,-8px);opacity:1}}
        `,
      }
    ),
    "riff-collapsing.svg": svg(
      `${aura({ calm: true })}${raccoon({ expression: "sleep", bodyClass: "collapse", leftHand: [2, 12], rightHand: [22, 12] })}`,
      {
        title: "Riff curls down into a cozy sleeping heap",
        css: `
          .collapse {animation:collapse .9s 1 steps(1,end) forwards;transform-origin:12px 18px}
          @keyframes collapse {0%,18%{transform:none}19%,34%{transform:scale(1.08,.88) translateY(2px)}35%,50%{transform:rotate(12deg) translate(3px,4px) scale(.96,.8)}51%,100%{transform:rotate(78deg) translate(5px,7px) scale(.88,.76)}}
        `,
      }
    ),
    "riff-sleeping.svg": svg(
      `${aura({ calm: true })}<g class="sleep-curl" transform="translate(5 7) rotate(72 12 10) scale(.88 .76)">${raccoon({ expression: "sleep", bodyClass: "sleep-breathe", tailClass: "sleep-tail", leftHand: [7, 10], rightHand: [17, 10] })}</g><g class="sleep-z" filter="url(#small-glow)"><text x="25" y="4" fill="${C.sky}" font-family="monospace" font-size="3.5" font-weight="900">Z</text><text x="30" y="-1" fill="${C.violet}" font-family="monospace" font-size="5" font-weight="900">Z</text></g>`,
      {
        title: "Riff sleeps curled safely around a fluffy tail",
        css: `
          .sleep-breathe {animation:sleep-breathe 4.8s infinite steps(1,end);transform-origin:12px 13px}
          .sleep-tail {animation:none}
          .sleep-z {animation:sleep-z 4.8s infinite steps(4,end)}
          @keyframes sleep-breathe {0%,49%,100%{transform:scale(1)}50%,99%{transform:scale(1.025,.985)}}
          @keyframes sleep-z {0%{transform:translate(0,3px);opacity:0}100%{transform:translate(4px,-6px);opacity:1}}
        `,
      }
    ),
    "riff-waking.svg": svg(
      `${aura()}${raccoon({ expression: "happy", bodyClass: "wake", leftHand: [-3, -2], rightHand: [27, -2] })}${speechBubble("I'M UP!", { accent: C.sky })}`,
      {
        title: "Riff wakes with an enormous stretch",
        css: `
          .wake {animation:wake 1.8s 1 steps(1,end) forwards;transform-origin:12px 18px}
          @keyframes wake {0%,15%{transform:rotate(78deg) translate(5px,7px) scale(.88,.76)}16%,34%{transform:scale(1.12,.82) translateY(3px)}35%,50%{transform:scale(.92,1.12) translateY(-4px)}51%,72%{transform:translateY(-1px)}73%,100%{transform:none}}
        `,
      }
    ),
  };
}

function reactionAssets() {
  return {
    "riff-react-drag.svg": svg(
      `${aura({ dense: true })}${raccoon({ expression: "happy", bodyClass: "drag-float", leftHand: [-2, 1], rightHand: [26, 1] })}`,
      {
        title: "Riff happily floats while being dragged",
        css: `.drag-float{animation:drag-float .72s infinite steps(1,end);transform-origin:12px 10px}@keyframes drag-float{0%,49%{transform:rotate(-5deg) translateY(-2px)}50%,100%{transform:rotate(5deg) translateY(1px)}}`,
      }
    ),
    "riff-react-drag-left.svg": svg(
      `${aura()}${raccoon({ expression: "surprise", bodyClass: "drag-left", leftHand: [20, 1], rightHand: [27, 7] })}`,
      {
        title: "Riff leans into a leftward drag",
        css: `.drag-left{animation:drag-left .62s infinite steps(1,end);transform-origin:12px 16px}@keyframes drag-left{0%,49%{transform:rotate(13deg) translateX(2px)}50%,100%{transform:rotate(8deg) translateX(1px)}}`,
      }
    ),
    "riff-react-drag-right.svg": svg(
      `${aura()}${raccoon({ expression: "happy", bodyClass: "drag-right", leftHand: [-3, 7], rightHand: [4, 1] })}`,
      {
        title: "Riff eagerly surfs a rightward drag",
        css: `.drag-right{animation:drag-right .62s infinite steps(1,end);transform-origin:12px 16px}@keyframes drag-right{0%,49%{transform:rotate(-13deg) translateX(-2px)}50%,100%{transform:rotate(-8deg) translateX(-1px)}}`,
      }
    ),
    "riff-react-left.svg": svg(
      `${aura()}${raccoon({ expression: "happy", bodyClass: "poke-left", headTilt: -12, leftHand: [-2, 0], rightHand: [23, 9] })}<path class="poke-star" d="M-5 1 l1 2 2 .2 -1.5 1.4 .5 2 -2-1 -2 1 .5-2 -1.5-1.4 2-.2z" fill="${C.lime}" filter="url(#soft-glow)"/>`,
      {
        title: "Riff turns a left poke into a cheeky wave",
        css: `.poke-left{animation:poke-left 2.6s 1 steps(1,end) forwards;transform-origin:12px 17px}@keyframes poke-left{0%,12%{transform:none}13%,24%{transform:translateX(3px) rotate(10deg) scale(.96,1.03)}25%,50%{transform:translateX(1px) rotate(-4deg)}51%,100%{transform:none}}`,
      }
    ),
    "riff-react-right.svg": svg(
      `${aura()}${raccoon({ expression: "happy", bodyClass: "poke-right", headTilt: 12, leftHand: [1, 9], rightHand: [26, 0] })}<path class="poke-star" d="M31 1 l1 2 2 .2 -1.5 1.4 .5 2 -2-1 -2 1 .5-2 -1.5-1.4 2-.2z" fill="${C.pink}" filter="url(#soft-glow)"/>`,
      {
        title: "Riff turns a right poke into a cheeky spin",
        css: `.poke-right{animation:poke-right 2.6s 1 steps(1,end) forwards;transform-origin:12px 17px}@keyframes poke-right{0%,12%{transform:none}13%,24%{transform:translateX(-3px) rotate(-10deg) scale(.96,1.03)}25%,50%{transform:translateX(-1px) rotate(4deg)}51%,100%{transform:none}}`,
      }
    ),
    "riff-react-annoyed.svg": svg(
      `${aura({ calm: true })}${raccoon({ expression: "annoyed", bodyClass: "annoyed", leftHand: [3, 10], rightHand: [21, 10] })}${speechBubble("BRUH.", { x: 18, width: 20, accent: C.violet })}`,
      {
        title: "Riff gives repeated pokes a tiny dramatic side-eye",
        css: `.annoyed{animation:annoyed 3.3s 1 steps(1,end) forwards;transform-origin:12px 18px}@keyframes annoyed{0%,20%{transform:none}21%,25%{transform:translateY(1px) scale(1.03,.97)}26%,78%{transform:rotate(-3deg)}79%,100%{transform:none}}`,
      }
    ),
    "riff-react-encore.svg": svg(
      `${aura({ dense: true })}${orbSet(5)}${raccoon({ expression: "happy", bodyClass: "encore", leftHand: [-3, -3], rightHand: [27, -3] })}${speechBubble("ENCORE!", { accent: C.pink })}`,
      {
        title: "Riff answers four clicks with an encore",
        css: `
          .orb-loop{animation:encore-orbs 1s infinite steps(8,end);transform-origin:12px -2px}
          .encore{animation:encore .9s infinite steps(1,end);transform-origin:12px 18px}
          @keyframes encore-orbs{to{transform:rotate(360deg)}}
          @keyframes encore{0%,24%{transform:rotate(-8deg) translateY(0)}25%,49%{transform:rotate(8deg) translateY(-4px)}50%,74%{transform:rotate(-5deg) translateY(-1px)}75%,100%{transform:rotate(5deg) translateY(-3px)}}
        `,
      }
    ),
  };
}

function miniFaceExpression(type = "smile") {
  if (type === "sleep" || type === "doze") {
    return `
    <path d="M6.8 11.2 Q8.2 12.5 9.6 11.2 M14.4 11.2 Q15.8 12.5 17.2 11.2" fill="none" stroke="${C.ink}" stroke-width=".85" stroke-linecap="round"/>
    <path d="M10.6 17 Q12 17.8 13.4 17" fill="none" stroke="${C.ink}" stroke-width=".58" stroke-linecap="round"/>`;
  }

  const mouth = {
    smile: `<path d="M9.6 17 Q12 18.7 14.4 17" fill="none" stroke="${C.ink}" stroke-width=".72" stroke-linecap="round"/>`,
    happy: `<path d="M9.5 16.7 Q12 19.7 14.5 16.7 Q12 20.8 9.5 16.7" fill="${C.pink}" stroke="${C.ink}" stroke-width=".58"/>`,
    surprise: `<ellipse cx="12" cy="17.2" rx="1.35" ry="1.6" fill="${C.ink}"/>`,
  }[type] || `<path d="M10 17.4 H14" stroke="${C.ink}" stroke-width=".65" stroke-linecap="round"/>`;

  return `
    <g class="hb-blink" style="transform-origin:12px 11px">
      <ellipse cx="8" cy="11.2" rx="2.1" ry="2.45" fill="${C.white}" stroke="${C.ink}" stroke-width=".52"/>
      <ellipse cx="16" cy="11.2" rx="2.1" ry="2.45" fill="${C.white}" stroke="${C.ink}" stroke-width=".52"/>
      <ellipse cx="8.2" cy="11.5" rx=".9" ry="1.2" fill="${C.ink}"/>
      <ellipse cx="16.2" cy="11.5" rx=".9" ry="1.2" fill="${C.ink}"/>
      <circle cx="8.5" cy="10.9" r=".32" fill="${C.white}"/>
      <circle cx="16.5" cy="10.9" r=".32" fill="${C.white}"/>
    </g>
    ${mouth}`;
}

function miniRaccoon(options = {}) {
  const {
    expression = "smile",
    bodyClass = "mini-bob",
    x = 0,
    y = 0,
    extra = "",
  } = options;
  return `
  <g class="${bodyClass}" transform="translate(${x} ${y})" style="transform-origin:12px 24px">
    <path d="M18 19 C30 15 31 27 22 29 C17 30 15 26 18 23" fill="${C.fur}" class="outline"/>
    <path d="M22 18 L25 29 M27 18 L29 26" stroke="${C.mask}" stroke-width="2.4" opacity=".9"/>
    <path d="M5 15 Q3 22 6 29 Q12 32 18 29 Q21 22 19 15 Z" fill="url(#jacket-gradient)" class="outline"/>
    <path d="M12 16 V29" stroke="${C.amber}" stroke-width=".8"/>
    <path d="M4 9 L5 3 L9 7 M20 9 L19 3 L15 7" fill="${C.fur}" class="outline"/>
    <path d="M3.5 9 Q4 5 12 4.5 Q20 5 20.5 9 L21 12 L19.8 13 L20 17 Q17 20 12 20.5 Q7 20 4 17 L4.2 13 L3 12 Z" fill="${C.furLight}" class="outline"/>
    <path d="M4 10 Q7 6.5 11 9 L9.5 14 Q6.5 15 4.2 13 Z M20 10 Q17 6.5 13 9 L14.5 14 Q17.5 15 19.8 13 Z" fill="${C.mask}"/>
    <path d="M9 14 Q12 12 15 14 L14.3 18 Q12 19 9.7 18 Z" fill="${C.cream}"/>
    <path d="M10.7 14 Q12 13.3 13.3 14 Q12 15.3 10.7 14" fill="${C.ink}"/>
    ${miniFaceExpression(expression)}
    <ellipse cx="7" cy="30" rx="3.5" ry="1.5" fill="${C.mask}"/><ellipse cx="17" cy="30" rx="3.5" ry="1.5" fill="${C.mask}"/>
    ${extra}
  </g>`;
}

function miniAssets() {
  const miniAura = `<circle class="hb-aura" cx="12" cy="15" r="18" fill="url(#aura-gradient)" stroke="${C.violet}" stroke-width=".7" stroke-dasharray="2 3"/>`;
  return {
    "riff-mini-idle.svg": svg(
      `${miniAura}${miniRaccoon()}`,
      {
        mini: true,
        title: "Mini Riff peeks from the screen edge",
        css: `.mini-bob{animation:mini-bob 3s infinite steps(1,end);transform-origin:12px 29px}@keyframes mini-bob{0%,45%,100%{transform:translateY(0)}46%,52%{transform:translateY(-2px)}53%,99%{transform:translateY(-.4px)}}`,
      }
    ),
    "riff-mini-alert.svg": svg(
      `${miniAura}<g class="mini-ring"><circle cx="12" cy="14" r="17" fill="none" stroke="${C.amber}" stroke-width="1.2"/></g>${miniRaccoon({ expression: "surprise", bodyClass: "mini-pop" })}<text x="25" y="4" font-family="monospace" font-size="5" font-weight="900" fill="${C.amber}">!</text>`,
      {
        mini: true,
        title: "Mini Riff pops up for an alert",
        css: `.mini-pop{animation:mini-pop 1.1s infinite steps(1,end);transform-origin:12px 29px}@keyframes mini-pop{0%,18%,70%,100%{transform:none}19%,27%{transform:translateY(-6px) scale(.94,1.08)}28%,69%{transform:translateY(-2px)}}.mini-ring{animation:mini-ring 1.1s infinite steps(3,end);transform-origin:12px 14px}@keyframes mini-ring{to{transform:scale(1.35);opacity:0}}`,
      }
    ),
    "riff-mini-happy.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "happy", bodyClass: "mini-dance", extra: `<path d="M4 20 L-1 12 M20 20 L25 12" stroke="${C.violet}" stroke-width="3" stroke-linecap="round"/>` })}`,
      {
        mini: true,
        title: "Mini Riff celebrates at the screen edge",
        css: `.mini-dance{animation:mini-dance .8s infinite steps(1,end);transform-origin:12px 29px}@keyframes mini-dance{0%,24%{transform:rotate(-7deg)}25%,49%{transform:rotate(7deg) translateY(-4px)}50%,74%{transform:rotate(-4deg) translateY(-1px)}75%,100%{transform:rotate(5deg) translateY(-3px)}}`,
      }
    ),
    "riff-mini-enter.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "happy", bodyClass: "mini-enter" })}`,
      {
        mini: true,
        title: "Mini Riff bounces into the screen edge",
        css: `.mini-enter{animation:mini-enter 1.25s 1 steps(1,end) forwards;transform-origin:12px 29px}@keyframes mini-enter{0%,12%{transform:translateX(25px) rotate(25deg) scale(.65);opacity:.2}13%,30%{transform:translate(-5px,-4px) rotate(-10deg) scale(1.08);opacity:1}31%,50%{transform:translate(2px,1px) rotate(4deg) scale(.98)}51%,100%{transform:none}}`,
      }
    ),
    "riff-mini-peek.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "smile", bodyClass: "mini-peek" })}<g class="mini-hi">${speechBubble("HI!", { x: 20, y: -8, width: 15, accent: C.sky })}</g>`,
      {
        mini: true,
        title: "Mini Riff leans out to say hi",
        css: `.mini-peek{animation:mini-peek 1.7s 1 steps(1,end) forwards;transform-origin:12px 29px}@keyframes mini-peek{0%,12%{transform:translateX(11px)}13%,28%{transform:translateX(-3px) rotate(-5deg)}29%,76%{transform:translateX(-1px)}77%,100%{transform:none}}`,
      }
    ),
    "riff-mini-working.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "smile", bodyClass: "mini-work", extra: `<g transform="translate(3 24)"><rect width="18" height="6" rx="1.2" fill="${C.ink}" stroke="${C.sky}" stroke-width=".6"/><g fill="${C.pink}"><rect x="3" y="2" width="2" height="2"/><rect x="7" y="2" width="2" height="2"/></g><g fill="${C.lime}"><rect x="11" y="2" width="2" height="2"/><rect x="15" y="2" width="2" height="2"/></g></g>` })}`,
      {
        mini: true,
        title: "Mini Riff mixes commands at the edge",
        css: `.mini-work{animation:mini-work 1s infinite steps(1,end);transform-origin:12px 29px}@keyframes mini-work{0%,49%{transform:translateY(0) rotate(-2deg)}50%,100%{transform:translateY(-1px) rotate(2deg)}}`,
      }
    ),
    "riff-mini-crabwalk.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "smile", bodyClass: "mini-crab" })}`,
      {
        mini: true,
        title: "Mini Riff scuttles sideways like a city explorer",
        css: `.mini-crab{animation:mini-crab 1.15s infinite steps(1,end);transform-origin:12px 29px}@keyframes mini-crab{0%,24%{transform:translateX(-5px) rotate(-4deg)}25%,49%{transform:translate(0,-2px) rotate(4deg)}50%,74%{transform:translateX(5px) rotate(-4deg)}75%,100%{transform:translate(0,-1px) rotate(4deg)}}`,
      }
    ),
    "riff-mini-enter-sleep.svg": svg(
      `${miniAura}${miniRaccoon({ expression: "doze", bodyClass: "mini-enter-sleep" })}`,
      {
        mini: true,
        title: "Mini Riff curls up for do not disturb mode",
        css: `.mini-enter-sleep{animation:mini-enter-sleep 1.45s 1 steps(1,end) forwards;transform-origin:12px 29px}@keyframes mini-enter-sleep{0%,15%{transform:none}16%,34%{transform:scale(1.08,.88) translateY(2px)}35%,52%{transform:rotate(18deg) translate(2px,4px)}53%,100%{transform:rotate(72deg) translate(5px,8px) scale(.84,.75)}}`,
      }
    ),
    "riff-mini-sleep.svg": svg(
      `${miniAura}<g transform="translate(1 8) rotate(16 12 18)">${miniRaccoon({ expression: "sleep", bodyClass: "mini-sleep" })}</g><text class="mini-z" x="26" y="7" font-family="monospace" font-size="5" font-weight="900" fill="${C.sky}">Z</text>`,
      {
        mini: true,
        title: "Mini Riff sleeps at the screen edge",
        css: `.mini-sleep{animation:mini-sleep 4s infinite steps(1,end);transform-origin:12px 22px}@keyframes mini-sleep{0%,49%,100%{transform:scale(1)}50%,99%{transform:scale(1.025,.985)}}.mini-z{animation:mini-z 4s infinite steps(4,end)}@keyframes mini-z{0%{transform:translate(0,4px);opacity:0}100%{transform:translate(5px,-8px);opacity:1}}`,
      }
    ),
  };
}

const assets = {
  ...normalAssets(),
  ...sleepAssets(),
  ...reactionAssets(),
  ...miniAssets(),
};

for (const [filename, source] of Object.entries(assets)) {
  fs.writeFileSync(path.join(OUT_DIR, filename), source, "utf8");
}

console.log(`Generated ${Object.keys(assets).length} Rave Raccoon SVG assets in ${OUT_DIR}`);
