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

waitForElement([".Root__top-container"], ([topContainer]) => {
  const r = document.documentElement;
  const rs = window.getComputedStyle(r);

  const backgroundContainer = document.createElement("div");
  backgroundContainer.className = "starrynight-bg-container";
  topContainer.appendChild(backgroundContainer);

  // to position stars and shooting stars between the background and everything else
  const rootElement = document.querySelector(".Root__top-container");
  rootElement.style.zIndex = "0";

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
    star.style.backgroundColor = rs.getPropertyValue("--spice-star");
    star.style.zIndex = "-1";
    star.style.borderRadius = "50%";

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
  topContainer = document.querySelector(".Root__top-container");
  const rightSidebarSlot = [...topContainer.children].find((el) =>
    getComputedStyle(el).gridArea.includes("right-sidebar"),
  );
  if (rightSidebarSlot) {
    new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      if (w === 0)
        topContainer.style.removeProperty("--starrynight-panel-width");
      else
        topContainer.style.setProperty("--starrynight-panel-width", `${w}px`);
    }).observe(rightSidebarSlot);
  }

  // Full original star density (~350 to 500 stars across the entire sky)
  const starsFraction = Math.floor(canvasSize / 4200);

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


