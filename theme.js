function waitForElement(els, func, timeout = 100) {
  const queries = els.map((el) => document.querySelector(el));
  if (queries.every((a) => a)) {
    func(queries);
  } else if (timeout > 0) {
    setTimeout(waitForElement, 50, els, func, --timeout);
  }
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

// the grid child occupying the given grid area (classes are hashed now)
function findGridChild(container, area) {
  return [...container.children].find((c) =>
    getComputedStyle(c).gridArea.split(' / ')[0] === area
  );
}

// Spotify 1.3.6 removed .Root__top-container; the global nav's parent is the root grid
waitForElement(['#global-nav-bar'], ([globalNav]) => {
  const topContainer = globalNav.parentElement;
  topContainer.classList.add('starrynight-top-container');
  const r = document.documentElement;
  const rs = window.getComputedStyle(r);

  const backgroundContainer = document.createElement('div');
  backgroundContainer.className = 'starrynight-bg-container';
  // prepend so the sky sits behind the panels instead of over them
  topContainer.prepend(backgroundContainer);

  // create the stars
  const canvasSize =
    backgroundContainer.clientWidth * backgroundContainer.clientHeight;
  const starsFraction = canvasSize / 4000;
  for (let i = 0; i < starsFraction; i++) {
    const size = Math.random() < 0.5 ? 1 : 2;

    const star = document.createElement("div");
    star.style.position = "absolute";
    star.style.left = `${random(0, 99)}%`;
    star.style.top = `${random(0, 99)}%`;
    star.style.opacity = random(0.5, 1);
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.backgroundColor = rs.getPropertyValue('--spice-star');
    star.style.borderRadius = '50%';

    if (Math.random() < 1 / 5) {
      star.style.setProperty(
        "animation",
        `twinkle${Math.floor(Math.random() * 4) + 1} 5s infinite`,
        "important",
      );
    }

    backgroundContainer.appendChild(star);
  }

  // handles resizing of playbar panel to match right sidebar below it
  // playbar/right sidebar located by testid / grid area
  waitForElement(['[data-testid="now-playing-bar"]'], ([bar]) => {
    const playbar = bar.closest('.starrynight-top-container > *');
    const rightbar = findGridChild(topContainer, 'right-sidebar');
    if (!playbar || !rightbar) return;
    playbar.classList.add('starrynight-playbar');
    rightbar.classList.add('starrynight-rightbar');

    // CSS makes the panel match the right sidebar's width; only give it its own
    // width (420px) when the right sidebar is closed.
    // the grid slot always stretches to the column, so measure the sidebar inside it
    // (collapsed, Spotify leaves a ~40px peek strip)
    const resizeObserver = new ResizeObserver(() => {
      const sidebar = rightbar.firstElementChild || rightbar;
      const sidebarOpen = sidebar.getBoundingClientRect().width > 50;
      playbar.style.width = sidebarOpen ? '' : '420px';
    });
    resizeObserver.observe(rightbar);
    if (rightbar.firstElementChild) resizeObserver.observe(rightbar.firstElementChild);
  });

  for (let i = 0; i < starsFraction; i++) {
    const size = Math.random() < 0.55 ? 1 : 2;
    const star = document.createElement('div');
    star.className = 'starrynight-star';
    const left = (Math.random() * 99.5).toFixed(2);
    const top = (Math.random() * 99.5).toFixed(2);
    const opacity = (random(0.4, 1)).toFixed(2);
    let css = `left:${left}%;top:${top}%;width:${size}px;height:${size}px;opacity:${opacity};`;
    if (Math.random() < 0.28) {
      const twId = Math.floor(Math.random() * 4) + 1;
      const twDur = Math.floor(Math.random() * 3) + 4;
      css += `animation:twinkle${twId} ${twDur}s infinite ease-in-out !important;`;
    }
    star.style.cssText = css;
    fragment.appendChild(star);
  }

  // 2. Original Delroy Prithvi Shooting Stars (Continuous Pure CSS Infinite Loop)
  const rawGlow = rs.getPropertyValue('--spice-rgb-shooting-star-glow');
  const shootingStarGlowColor = rawGlow ? `rgba(${rawGlow},0.15)` : 'rgba(255,255,255,0.15)';
  const shootingConfigs = [
    { top: '-4px', right: '15%', dur: '4s', delay: '0s' },
    { top: '30%', right: '-4px', dur: '4.5s', delay: '1.2s' },
    { top: '-4px', right: '60%', dur: '5s', delay: '2.5s' },
    { top: '45%', right: '-4px', dur: '4.2s', delay: '3.8s' },
  ];

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */
  for (let i = 0; i < 4; i++) {
    const shootingstar = document.createElement("span");
    shootingstar.className = "shootingstar";
    if (Math.random() < 0.75) {
      shootingstar.style.top = "-4px"; // hidden off screen when animation is delayed
      shootingstar.style.right = `${random(0, 90)}%`;
    } else {
      shootingstar.style.top = `${random(0, 50)}%`;
      shootingstar.style.right = "-4px"; // hidden when animation is delayed
    }

    const shootingStarGlowColor = `rgba(${rs.getPropertyValue(
      "--spice-rgb-shooting-star-glow",
    )},${0.1})`;
    shootingstar.style.boxShadow = `0 0 0 4px ${shootingStarGlowColor}, 0 0 0 8px ${shootingStarGlowColor}, 0 0 20px ${shootingStarGlowColor}`;
    shootingstar.style.setProperty('animation-duration', cfg.dur, 'important');
    shootingstar.style.setProperty('animation-delay', cfg.delay, 'important');
    fragment.appendChild(shootingstar);
  });

  backgroundContainer.appendChild(fragment);

  // 3. Resize and collapse observer: when right sidebar collapses, collapse top playbar too!
  const setupResizeObserver = () => {
    const container = document.querySelector('.Root__top-container');
    if (!container) return;
    const rightSidebarSlot = document.querySelector(
      '.Root__right-sidebar, aside#Desktop_PanelContainer_Id, [data-testid="right-sidebar"]'
    );

    shootingstar.addEventListener("animationend", () => {
      if (Math.random() < 0.75) {
        shootingstar.style.top = "-4px"; // hidden off screen when animation is delayed
        shootingstar.style.right = `${random(0, 90)}%`;
      } else {
        shootingstar.style.top = `${random(0, 50)}%`;
        shootingstar.style.right = "-4px"; // hidden when animation is delayed
      }

      shootingstar.style.animation = "none"; // Remove animation

        if (w < 200) {
          document.body.classList.add('starrynight-sidebar-collapsed');
          container.style.removeProperty('--starrynight-panel-width');
        } else {
          document.body.classList.remove('starrynight-sidebar-collapsed');
          container.style.setProperty('--starrynight-panel-width', `${w}px`);
        }
      };

      shootingstar.style.animation = "";
      shootingstar.style.setProperty(
        "animation-duration",
        `${Math.floor(Math.random() * 4) + 3}s`,
        "important",
      );
    });
  }
});


