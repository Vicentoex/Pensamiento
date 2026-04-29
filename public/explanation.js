(function () {
  'use strict';

  var GREEN_HEX = '#1ea65a';
  var RED_HEX = '#c62828';
  var LABEL_H_EST = 92;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function buildParts(sentence, arrows) {
    var parts = [];
    var segments = sentence.split(/(\s+)/);
    var wi = 0;
    for (var s = 0; s < segments.length; s++) {
      var seg = segments[s];
      if (/^\s+$/.test(seg)) {
        parts.push({ isSpace: true, text: seg });
      } else {
        var idx = wi++;
        var arrowIdx = null, color = null;
        for (var a = 0; a < arrows.length; a++) {
          if (arrows[a].tokenIndices.indexOf(idx) !== -1) { arrowIdx = a; color = arrows[a].color; break; }
        }
        parts.push({ isSpace: false, text: seg, wi: idx, arrowIdx: arrowIdx, color: color });
      }
    }
    return parts;
  }

  function renderTokens(container, parts) {
    var map = new Map();
    container.innerHTML = '';
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (p.isSpace) {
        container.appendChild(document.createTextNode(p.text));
      } else {
        var span = document.createElement('span');
        span.className = 'token';
        span.textContent = p.text;
        container.appendChild(span);
        map.set(p.wi, span);
      }
    }
    return map;
  }

  function groupRect(spanMap, indices, wrapper) {
    var wr = wrapper.getBoundingClientRect();
    var l = Infinity, r = -Infinity, t = Infinity, b = -Infinity;
    for (var k = 0; k < indices.length; k++) {
      var span = spanMap.get(indices[k]);
      if (!span) continue;
      var sr = span.getBoundingClientRect();
      if (sr.left < l) l = sr.left;
      if (sr.right > r) r = sr.right;
      if (sr.top < t) t = sr.top;
      if (sr.bottom > b) b = sr.bottom;
    }
    return { l: l - wr.left, r: r - wr.left, t: t - wr.top, b: b - wr.top, cx: (l + r) / 2 - wr.left };
  }

  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    var keys = Object.keys(attrs);
    for (var i = 0; i < keys.length; i++) el.setAttribute(keys[i], attrs[keys[i]]);
    return el;
  }

  async function drawLine(svg, x1, y1, x2, y2, color) {
    var len = Math.hypot(x2 - x1, y2 - y1);
    var line = svgEl('line', {
      x1: x1, y1: y1, x2: x2, y2: y2,
      stroke: color, 'stroke-width': 1.5, 'stroke-linecap': 'round',
      'stroke-dasharray': len, 'stroke-dashoffset': len
    });
    svg.appendChild(line);
    await sleep(30);
    line.style.transition = 'stroke-dashoffset 0.45s ease';
    line.setAttribute('stroke-dashoffset', 0);
    await sleep(480);
  }

  function placeLabel(wrapper, text, cx, topY, colorClass) {
    var div = document.createElement('div');
    div.className = 'arrow-label arrow-label-' + colorClass;
    div.textContent = text;
    div.style.cssText = 'left:' + cx + 'px;top:' + topY + 'px;transform:translateX(-50%) translateY(8px);opacity:0;';
    wrapper.appendChild(div);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        div.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        div.style.opacity = '1';
        div.style.transform = 'translateX(-50%) translateY(0)';
      });
    });
  }

  async function showArrow(wrapper, svg, spanMap, arrowDef) {
    var ww = wrapper.offsetWidth;
    var rect = groupRect(spanMap, arrowDef.tokenIndices, wrapper);
    var cx = Math.max(150, Math.min(rect.cx, ww - 150));
    var offset = arrowDef.offset || 80;
    var color = arrowDef.color === 'green' ? GREEN_HEX : RED_HEX;

    var fromY, toY, labelTop;
    if (arrowDef.side === 'above') {
      fromY = rect.t;
      toY = fromY - offset;
      labelTop = toY - LABEL_H_EST;
    } else {
      fromY = rect.b;
      toY = fromY + offset;
      labelTop = toY;
    }

    var dot = svgEl('circle', { cx: cx, cy: fromY, r: 3, fill: color, opacity: 0 });
    svg.appendChild(dot);
    await sleep(20);
    dot.style.transition = 'opacity 0.2s';
    dot.setAttribute('opacity', 1);
    await sleep(220);

    await drawLine(svg, cx, fromY, cx, toY, color);
    placeLabel(wrapper, arrowDef.label, cx, labelTop, arrowDef.color);
    await sleep(600);
  }

  async function run() {
    var config = window.ROUND_CONFIG;
    if (!config) return;

    var introOverlay = document.getElementById('introOverlay');
    var sentenceDisplay = document.getElementById('sentenceDisplay');
    var animWrapper = document.getElementById('animWrapper');
    var arrowSvg = document.getElementById('arrowSvg');

    var parts = buildParts(config.sentence, config.arrows);
    var spanMap = renderTokens(sentenceDisplay, parts);

    // Intro
    introOverlay.style.opacity = '1';
    introOverlay.style.pointerEvents = 'auto';
    await sleep(3800);
    introOverlay.style.opacity = '0';
    await sleep(900);
    introOverlay.style.pointerEvents = 'none';

    // Sentence
    sentenceDisplay.style.transition = 'opacity 0.5s ease';
    sentenceDisplay.style.opacity = '1';
    await sleep(1300);

    // Green tokens
    var arrows = config.arrows;
    for (var a = 0; a < arrows.length; a++) {
      if (arrows[a].color !== 'green') continue;
      var gi = arrows[a].tokenIndices;
      for (var g = 0; g < gi.length; g++) {
        var gs = spanMap.get(gi[g]);
        if (gs) { gs.classList.add('token-green'); await sleep(155); }
      }
    }
    await sleep(650);

    // Red tokens
    for (var a2 = 0; a2 < arrows.length; a2++) {
      if (arrows[a2].color !== 'red') continue;
      var ri = arrows[a2].tokenIndices;
      for (var r2 = 0; r2 < ri.length; r2++) {
        var rs = spanMap.get(ri[r2]);
        if (rs) { rs.classList.add('token-red'); await sleep(155); }
      }
    }
    await sleep(750);

    // SVG size
    var wh = animWrapper.offsetHeight;
    var ww2 = animWrapper.offsetWidth;
    arrowSvg.setAttribute('width', ww2);
    arrowSvg.setAttribute('height', wh);
    arrowSvg.style.width = ww2 + 'px';
    arrowSvg.style.height = wh + 'px';

    // Arrows
    for (var i = 0; i < arrows.length; i++) {
      await showArrow(animWrapper, arrowSvg, spanMap, arrows[i]);
      await sleep(900);
    }
  }

  document.addEventListener('DOMContentLoaded', run);
})();
