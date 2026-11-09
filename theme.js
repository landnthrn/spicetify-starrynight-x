/* StarryNight runtime: compatible component discovery, stars, and player state.
   The visual layout and colors remain controlled by user.css and color.ini. */
(() => {
  'use strict';

  // Avoid duplicate observers and player listeners if the theme script reloads.
  const runtimeKey = '__starrynightRuntime';
  window[runtimeKey]?.destroy?.();

  let root = null;
  let playbarSlot = null;
  let rightbarSlot = null;
  let sidebarTarget = null;
  let rootObserver = null;
  let resizeObserver = null;
  let refreshFrame = 0;
  let measureFrame = 0;
  let lastWidth = null;
  let player = null;
  let playerPoll = 0;
  let songChangeTimer = 0;
  let destroyed = false;

  const random = (min, max) => Math.random() * (max - min) + min;

  function findRoot() {
    // Prefer the navigation ID; fall back to the legacy root class.
    return document.getElementById('global-nav-bar')?.parentElement ||
      document.querySelector('.Root__top-container');
  }

  function gridChild(container, area) {
    return [...container.children].find((element) =>
      getComputedStyle(element).gridArea.split('/')[0].trim() === area
    ) || null;
  }

  function directChild(container, descendant) {
    if (!descendant || !container.contains(descendant)) return null;
    let element = descendant;
    while (element.parentElement && element.parentElement !== container) {
      element = element.parentElement;
    }
    return element.parentElement === container ? element : null;
  }

  /*
   * Shooting-star effect copyright (c) 2021 Delroy Prithvi
   * https://codepen.io/delroyprithvi/pen/LYyJROR
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:
   *
   * The above copyright notice and this permission notice shall be included in
   * all copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
   * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
   * THE SOFTWARE.
   */

  function createSky(container) {
    // Batch star creation while retaining the existing density and timings.
    document.querySelector('.starrynight-canvas')?.remove();
    let sky = container.querySelector(':scope > .starrynight-bg-container');
    if (!sky) {
      sky = document.createElement('div');
      sky.className = 'starrynight-bg-container';
      container.appendChild(sky);
    }
    container.style.zIndex = '0'; // Keep the sky behind Spotify's panels.

    const styles = getComputedStyle(document.documentElement);
    const area = (sky.clientWidth * sky.clientHeight) ||
      (window.innerWidth * window.innerHeight);
    const fragment = document.createDocumentFragment();

    for (let i = 0, count = Math.floor(area / 4200); i < count; i++) {
      const star = document.createElement('div');
      star.className = 'starrynight-star';
      const size = Math.random() < 0.55 ? 1 : 2;
      let css = `left:${(Math.random() * 99.5).toFixed(2)}%;` +
        `top:${(Math.random() * 99.5).toFixed(2)}%;` +
        `width:${size}px;height:${size}px;` +
        `opacity:${random(0.4, 1).toFixed(2)};`;
      if (Math.random() < 0.28) {
        const variant = Math.floor(Math.random() * 4) + 1;
        const seconds = Math.floor(Math.random() * 3) + 4;
        css += `animation:twinkle${variant} ${seconds}s infinite ease-in-out !important;`;
      }
      star.style.cssText = css;
      fragment.appendChild(star);
    }

    const rawGlow = styles.getPropertyValue('--spice-rgb-shooting-star-glow');
    const glow = rawGlow ? `rgba(${rawGlow},0.15)` : 'rgba(255,255,255,0.15)';
    const meteors = [
      { top: '-4px', right: '15%', duration: '4s', delay: '0s' },
      { top: '30%', right: '-4px', duration: '4.5s', delay: '1.2s' },
      { top: '-4px', right: '60%', duration: '5s', delay: '2.5s' },
      { top: '45%', right: '-4px', duration: '4.2s', delay: '3.8s' },
    ];
    for (const { top, right, duration, delay } of meteors) {
      const meteor = document.createElement('span');
      meteor.className = 'shootingstar';
      meteor.style.top = top;
      meteor.style.right = right;
      meteor.style.boxShadow = `0 0 0 4px ${glow}, 0 0 0 8px ${glow}, 0 0 20px ${glow}`;
      meteor.style.setProperty('animation-duration', duration, 'important');
      meteor.style.setProperty('animation-delay', delay, 'important');
      fragment.appendChild(meteor);
    }
    sky.replaceChildren(fragment);
  }

  function scheduleMeasure() {
    if (destroyed || measureFrame) return;
    measureFrame = requestAnimationFrame(() => {
      measureFrame = 0;
      if (!root?.isConnected || !sidebarTarget?.isConnected) return;
      // Measure current width instead of using a queued observer entry.
      const width = Math.round(sidebarTarget.getBoundingClientRect().width);
      if (width === lastWidth) return;
      lastWidth = width;
      const collapsed = width < 200; // Maintain Carlitos's existing behavior.
      document.body.classList.toggle('starrynight-sidebar-collapsed', collapsed);
      if (collapsed) {
        root.style.removeProperty('--starrynight-panel-width');
      } else {
        root.style.setProperty('--starrynight-panel-width', `${width}px`);
      }
    });
  }

  function watchSidebar(slot, target) {
    if (slot === rightbarSlot && target === sidebarTarget) return;
    resizeObserver?.disconnect();
    resizeObserver = null;
    rightbarSlot = slot;
    sidebarTarget = target;
    lastWidth = null;

    if (!slot || !target) {
      root?.style.removeProperty('--starrynight-panel-width');
      return;
    }
    resizeObserver = new ResizeObserver(scheduleMeasure);
    resizeObserver.observe(slot);
    if (target !== slot) resizeObserver.observe(target);
    scheduleMeasure();
  }

  function reconcileSlots() {
    if (!root?.isConnected) return;
    const bar = root.querySelector('[data-testid="now-playing-bar"]');
    const panel = root.querySelector('#Desktop_PanelContainer_Id, aside[aria-label="Now playing view"]');
    const nextPlaybar = directChild(root, bar) || gridChild(root, 'now-playing-bar');
    const nextRightbar = gridChild(root, 'right-sidebar') || directChild(root, panel);

    if (nextPlaybar !== playbarSlot) {
      playbarSlot?.classList.remove('starrynight-playbar');
      playbarSlot = nextPlaybar;
      playbarSlot?.classList.add('starrynight-playbar');
    }
    if (nextRightbar !== rightbarSlot) {
      rightbarSlot?.classList.remove('starrynight-rightbar');
      nextRightbar?.classList.add('starrynight-rightbar');
    }

    // Prefer the real right panel. When closed it may be unmounted, leaving
    // only Spotify's narrow peek element in the right-sidebar grid slot.
    const target = panel && nextRightbar?.contains(panel)
      ? panel
      : nextRightbar?.firstElementChild || nextRightbar;
    watchSidebar(nextRightbar, target || null);
  }

  function attachRoot(nextRoot) {
    if (nextRoot === root) return;
    rootObserver?.disconnect();
    rootObserver = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
    playbarSlot?.classList.remove('starrynight-playbar');
    rightbarSlot?.classList.remove('starrynight-rightbar');
    root?.classList.remove('starrynight-top-container');
    root?.style.removeProperty('--starrynight-panel-width');
    playbarSlot = rightbarSlot = sidebarTarget = null;
    lastWidth = null;
    root = nextRoot;
    if (!root) return;

    root.classList.add('starrynight-top-container');
    createSky(root);
    rootObserver = new MutationObserver((records) => {
      // Ignore unrelated track-list and sky mutations when already connected.
      if (!playbarSlot || !rightbarSlot || records.some(({ target }) =>
        target === root ||
        rightbarSlot?.contains(target) ||
        playbarSlot?.contains(target)
      )) scheduleRefresh();
    });
    rootObserver.observe(root, { childList: true, subtree: true });
  }

  function scheduleRefresh() {
    if (destroyed || refreshFrame) return;
    refreshFrame = requestAnimationFrame(() => {
      refreshFrame = 0;
      const nextRoot = findRoot();
      if (nextRoot !== root) attachRoot(nextRoot);
      reconcileSlots();
    });
  }

  function syncPlaying() {
    if (destroyed || !player) return;
    try {
      document.body.classList.toggle('starrynight-is-playing', !!player.isPlaying());
    } catch (_) { /* The player API may initialize after the DOM. */ }
  }

  function onSongChange() {
    syncPlaying();
    clearTimeout(songChangeTimer);
    songChangeTimer = setTimeout(syncPlaying, 100);
  }

  function connectPlayer() {
    if (destroyed || player) return;
    const available = window.Spicetify?.Player;
    if (!available?.addEventListener || !available?.isPlaying) return;
    player = available;
    player.addEventListener('onplaypause', syncPlaying);
    player.addEventListener('songchange', onSongChange);
    syncPlaying();
    clearInterval(playerPoll);
    playerPoll = 0;
  }

  const documentObserver = new MutationObserver(() => {
    // Detect root replacement without traversing unrelated nested nodes.
    const nav = document.getElementById('global-nav-bar');
    if (!root?.isConnected || (nav && nav.parentElement !== root)) scheduleRefresh();
  });

  function destroy() {
    if (destroyed) return;
    destroyed = true;
    documentObserver.disconnect();
    rootObserver?.disconnect();
    resizeObserver?.disconnect();
    cancelAnimationFrame(refreshFrame);
    cancelAnimationFrame(measureFrame);
    clearInterval(playerPoll);
    clearTimeout(songChangeTimer);
    player?.removeEventListener?.('onplaypause', syncPlaying);
    player?.removeEventListener?.('songchange', onSongChange);
    playbarSlot?.classList.remove('starrynight-playbar');
    rightbarSlot?.classList.remove('starrynight-rightbar');
    root?.classList.remove('starrynight-top-container');
    root?.style.removeProperty('--starrynight-panel-width');
    document.body?.classList.remove('starrynight-sidebar-collapsed', 'starrynight-is-playing');
    if (window[runtimeKey]?.destroy === destroy) delete window[runtimeKey];
  }

  window[runtimeKey] = { destroy };
  if (document.documentElement) {
    documentObserver.observe(document.documentElement, { childList: true, subtree: true });
    scheduleRefresh();
  } else {
    document.addEventListener('DOMContentLoaded', scheduleRefresh, { once: true });
  }
  connectPlayer();
  if (!player) playerPoll = setInterval(connectPlayer, 500);
})();
