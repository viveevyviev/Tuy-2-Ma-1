let traits = [];
let spawnerTraits = [];
let originalSpawners = [];
let player;
let selectedTrait = null;
let newTrait = null;

let yearningImg, courageImg, attentiveImg;
let nestledImg, anchoringImg, defiantImg, empatheticImg, vulnerableImg;
let flipHImg, flipVImg;
let screenshotBtnImg, trashBtnImg, resetBtnImg, cookBtnImg, backBtnImg;
let popupImg, playBtnImg;
let bgImg, bgImg2;

// --- All UI element dimensions are now calculated in setup() ---
let flipHX, flipHY, flipVX, flipVY;
let trashX, trashY, trashW, trashH;
let resetBtnX, resetBtnY, resetBtnW, resetBtnH; // Renamed for clarity
let cookBtnX, cookBtnY, cookBtnW, cookBtnH;
let backBtnX, backBtnY, backBtnW, backBtnH;
let screenshotBtnX, screenshotBtnY, screenshotBtnW, screenshotBtnH;
let playBtnX, playBtnY, playBtnW, playBtnH;

let inCookScene = false;
let resizing = false;
let rotating = false;
let showIntro = true;
let takingScreenshot = false;

function preload() {
  yearningImg = loadImage('traits/yearning.png');
  courageImg = loadImage('traits/courage.png');
  attentiveImg = loadImage('traits/attentive.png');
  nestledImg = loadImage('traits/nestled.png');
  anchoringImg = loadImage('traits/anchoring.png');
  defiantImg = loadImage('traits/defiant.png');
  empatheticImg = loadImage('traits/empathetic.png');
  vulnerableImg = loadImage('traits/vulnerable.png');
  flipHImg = loadImage('buttons/flipH.png');
  flipVImg = loadImage('buttons/flipV.png');
  trashBtnImg = loadImage('buttons/trash.png');
  resetBtnImg = loadImage('buttons/reset.png');
  cookBtnImg = loadImage('buttons/cook.png');
  backBtnImg = loadImage('buttons/back.png');
  screenshotBtnImg = loadImage('buttons/screenshot.png');
  bgImg = loadImage('buttons/background.png');
  bgImg2 = loadImage('buttons/background2.png');
  popupImg = loadImage('buttons/popup.png');
  playBtnImg = loadImage('buttons/play.png');
}

function setup() {
  // Keep the canvas responsive with a 16:9 aspect ratio
  let w = windowWidth;
  let h = w * 9 / 16;
  if (h > windowHeight) {
    h = windowHeight;
    w = h * 16 / 9;
  }
  createCanvas(w, h);

  // --- RESPONSIVE UI CALCULATIONS ---
  // Define base sizes and margins as a percentage of the canvas width
  let baseButtonSize = width * 0.055; // A good base size for most buttons
  let largeButtonSize = width * 0.065; // For the main action buttons
  let edgeMargin = width * 0.015;      // Margin from the edge of the canvas
  let buttonMargin = width * 0.01;     // Margin between buttons

  // --- Trait Spawners ---
  // The scale for spawned traits will be 0.3 (or 30%), as you requested.
  // The spawner icons themselves are smaller (0.15)
  let spawnerScale = 0.07;
  let spawnedTraitScale = 0.2; // This is the "30%" scale for new traits

  // Spawner positions are already nicely responsive!
  const w1 = 0.09 * w, w2 = 0.172185430 * w;
  const h1 = 0.353200 * h, h2 = 0.588668 * h;
  originalSpawners = [
    { img: yearningImg,    x: w1,  y: h1 },
    { img: courageImg,     x: w2, y: h1 },
    { img: attentiveImg,   x: w - w2, y: h1 },
    { img: nestledImg,     x: w1, y: h2 },
    { img: anchoringImg,   x: w2, y: h2 },
    { img: defiantImg,     x: w - w2, y: h2 },
    { img: empatheticImg,  x: w - w1, y: h1 },
    { img: vulnerableImg,  x: w - w1, y: h2 }
  ].map(t => ({
    ...t,
    scale: spawnerScale,
    spawnScale: spawnedTraitScale
  }));

  spawnerTraits = originalSpawners.map(s => new Trait(s.x, s.y, false, s.img, s.scale, s.spawnScale));

  // --- Main Scene Buttons (Bottom Right) ---
  // Positioned from right-to-left
  cookBtnW = largeButtonSize;
  cookBtnH = largeButtonSize;
  cookBtnX = width - cookBtnW - edgeMargin;
  cookBtnY = height - cookBtnH - edgeMargin;

  resetBtnW = largeButtonSize;
  resetBtnH = largeButtonSize;
  resetBtnX = cookBtnX - resetBtnW - buttonMargin;
  resetBtnY = cookBtnY;

  trashW = largeButtonSize;
  trashH = largeButtonSize;
  trashX = resetBtnX - trashW - buttonMargin;
  trashY = cookBtnY;
  
  // --- Main Scene Buttons (Bottom Left) ---
  flipHX = edgeMargin;
  flipHY = height - baseButtonSize - edgeMargin;
  flipVX = flipHX + baseButtonSize + buttonMargin;
  flipVY = flipHY;

  // --- Cook Scene Buttons (Bottom Right) ---
  backBtnW = baseButtonSize;
  backBtnH = baseButtonSize;
  backBtnX = width - backBtnW - edgeMargin;
  backBtnY = height - backBtnH - edgeMargin;

  screenshotBtnW = baseButtonSize;
  screenshotBtnH = baseButtonSize;
  screenshotBtnX = backBtnX - screenshotBtnW - buttonMargin;
  screenshotBtnY = backBtnY;

  // --- Intro Popup Button ---
  // This uses a larger percentage for prominence. The aspect ratio is preserved.
  playBtnW = width * 0.12;
  playBtnH = playBtnW / 2.5; // Original aspect ratio was 150/60 = 2.5
  playBtnX = width / 2 - playBtnW / 2;
  playBtnY = height * 0.75 - playBtnH / 2;
}

function draw() {
  image(inCookScene ? bgImg2 : bgImg, 0, 0, width, height);

  if (showIntro) {
    image(popupImg, 0, 0, width, height);
    drawButton(playBtnImg, playBtnX, playBtnY, playBtnW, playBtnH);
    return;
  }

  player = createVector(mouseX, mouseY);

  if (!inCookScene) {
    drawButton(trashBtnImg, trashX, trashY, trashW, trashH);
    drawButton(resetBtnImg, resetBtnX, resetBtnY, resetBtnW, resetBtnH);
    drawButton(cookBtnImg, cookBtnX, cookBtnY, cookBtnW, cookBtnH);
    // Use the calculated baseButtonSize for the flip buttons' container
    let btnSize = width * 0.055;
    drawButton(flipHImg, flipHX, flipHY, btnSize, btnSize);
    drawButton(flipVImg, flipVX, flipVY, btnSize, btnSize);
    for (let s of spawnerTraits) s.display();
  } else {
    if (!takingScreenshot) {
      drawButton(backBtnImg, backBtnX, backBtnY, backBtnW, backBtnH);
      drawButton(screenshotBtnImg, screenshotBtnX, screenshotBtnY, screenshotBtnW, screenshotBtnH);
    }
  }

  for (let t of traits) t.update();
  for (let t of traits) t.display();

  if (selectedTrait && !inCookScene) selectedTrait.drawHandles();

  if (takingScreenshot) {
    saveCanvas('happy-pride-month', 'png');
    takingScreenshot = false;
  }
}

function drawButton(img, x, y, w, h) {
  push();
  let aspect = img.width / img.height;
  let drawW = w;
  let drawH = h;
  // This logic correctly scales the image to fit inside the button area (w, h)
  // We'll reduce the size slightly for a padding effect
  if (aspect > 1) drawH = (w / aspect) * 0.8;
  else drawW = (h * aspect) * 0.8;

  if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
    drawingContext.shadowBlur = 15;
    drawingContext.shadowColor = color(255, 150, 200);
  }

  imageMode(CENTER);
  image(img, x + w / 2, y + h / 2, drawW, drawH);
  drawingContext.shadowBlur = 0;
  pop();
}

function mousePressed() {
  if (showIntro) {
    if (mouseX > playBtnX && mouseX < playBtnX + playBtnW && mouseY > playBtnY && mouseY < playBtnY + playBtnH) {
      showIntro = false;
    }
    return;
  }

  // Use the calculated dimensions for hit detection
  let flipButtonSize = width * 0.055; 

  if (!inCookScene) {
    if (mouseX > flipHX && mouseX < flipHX + flipButtonSize && mouseY > flipHY && mouseY < flipHY + flipButtonSize) {
      if (selectedTrait) selectedTrait.flipH *= -1;
      return;
    }
    if (mouseX > flipVX && mouseX < flipVX + flipButtonSize && mouseY > flipVY && mouseY < flipVY + flipButtonSize) {
      if (selectedTrait) selectedTrait.flipV *= -1;
      return;
    }
    if (mouseX > resetBtnX && mouseX < resetBtnX + resetBtnW && mouseY > resetBtnY && mouseY < resetBtnY + resetBtnH) {
      traits = [];
      selectedTrait = null;
      return;
    }
    if (mouseX > cookBtnX && mouseX < cookBtnX + cookBtnW && mouseY > cookBtnY && mouseY < cookBtnY + cookBtnH) {
      inCookScene = true;
      selectedTrait = null;
      return;
    }
    if (mouseX > trashX && mouseX < trashX + trashW && mouseY > trashY && mouseY < trashY + trashH) {
      if (selectedTrait) {
        let index = traits.indexOf(selectedTrait);
        if (index > -1) traits.splice(index, 1);
        selectedTrait = null;
      }
      return;
    }

    if (selectedTrait) {
      if (selectedTrait.isOverResizeHandle(mouseX, mouseY)) {
        resizing = true;
        selectedTrait.startResizing(mouseX, mouseY);
        return;
      } else if (selectedTrait.isOverRotateHandle(mouseX, mouseY)) {
        rotating = true;
        selectedTrait.startRotating(mouseX, mouseY);
        return;
      }
    }

    let clickedAny = false;
    for (let i = traits.length - 1; i >= 0; i--) {
      if (traits[i].pressed(mouseX, mouseY)) {
        traits.push(traits.splice(i, 1)[0]);
        selectedTrait = traits[traits.length - 1];
        clickedAny = true;
        break;
      }
    }

    if (!clickedAny) {
      for (let i = spawnerTraits.length - 1; i >= 0; i--) {
        if (spawnerTraits[i].pressed(mouseX, mouseY)) {
          clickedAny = true;
          break;
        }
      }
    }

    if (!clickedAny) selectedTrait = null;
  } else {
    if (mouseX > backBtnX && mouseX < backBtnX + backBtnW && mouseY > backBtnY && mouseY < backBtnY + backBtnH) {
      inCookScene = false;
      return;
    }
    if (mouseX > screenshotBtnX && mouseX < screenshotBtnX + screenshotBtnW && mouseY > screenshotBtnY && mouseY < screenshotBtnY + screenshotBtnH) {
      takingScreenshot = true;
      return;
    }
  }
}

// mouseDragged and mouseReleased are fine as they are.
function mouseDragged() {
  if (!inCookScene && resizing && selectedTrait) selectedTrait.resize(mouseX, mouseY);
  if (!inCookScene && rotating && selectedTrait) selectedTrait.rotateTo(mouseX, mouseY);
}

function mouseReleased() {
  resizing = false;
  rotating = false;
  for (let t of traits) t.released();
  newTrait = null;
}

class Trait {
  constructor(x, y, isTrait, img, scale = 1, spawnScale = 1) {
    this.x = x;
    this.y = y;
    this.img = img;
    this.scale = scale;
    this.spawnScale = spawnScale;
    this.isTrait = isTrait;

    this.rotation = 0;
    this.flipH = 1;
    this.flipV = 1;
    this.dragging = false;
    this.offsetX = 0;
    this.offsetY = 0;

    this.initialDistance = 0;
    this.initialScale = this.scale;
    this.initialAngle = 0;
    this.initialRotation = 0;

    // Make handle size responsive
    this.handleSize = width * 0.01;

    this.updateSize();
  }

  updateSize() {
    this.width = this.img.width * this.scale;
    this.height = this.img.height * this.scale;
  }

  display() {
    let hovered = dist(mouseX, mouseY, this.x, this.y) < max(this.width, this.height) / 2;

    push();
    translate(this.x, this.y);
    rotate(this.rotation);
    scale(this.flipH, this.flipV);
    imageMode(CENTER);

    if (hovered && !this.dragging && selectedTrait !== this) {
      drawingContext.shadowBlur = 40;
      drawingContext.shadowColor = color(255, 255, 255);
    }

    if (selectedTrait === this && !inCookScene) {
      drawingContext.shadowBlur = 30;
      drawingContext.shadowColor = color(255, 255, 255);
    }

    let sizeMult = hovered ? 1.05 : 1;
    image(this.img, 0, 0, this.width * sizeMult, this.height * sizeMult);
    drawingContext.shadowBlur = 0;

    if (selectedTrait === this && !inCookScene) {
      noFill();
      stroke(255);
      strokeWeight(2);
      rectMode(CENTER);
      rect(0, 0, this.width + 4, this.height + 4);
    }

    pop();
  }

  update() {
    if (this.dragging) {
      this.x = mouseX + this.offsetX;
      this.y = mouseY + this.offsetY;
    }
  }

  pressed(mx, my) {
    // Check for click within the bounding box of the rotated image
    // This is more accurate than a simple circle for rectangular images
    let cosA = cos(-this.rotation);
    let sinA = sin(-this.rotation);
    let dx = mx - this.x;
    let dy = my - this.y;
    let rotatedX = dx * cosA - dy * sinA;
    let rotatedY = dx * sinA + dy * cosA;

    if (abs(rotatedX) < this.width / 2 && abs(rotatedY) < this.height / 2) {
      if (!this.isTrait) {
        // The spawner was clicked, create a new trait
        let t = new Trait(width / 2, height / 2, true, this.img, this.spawnScale);
        traits.push(t);
        selectedTrait = t;
        // Start dragging the new trait immediately
        selectedTrait.dragging = true;
        selectedTrait.offsetX = selectedTrait.x - mx;
        selectedTrait.offsetY = selectedTrait.y - my;
        return true;
      } else {
        // An existing trait was clicked
        this.dragging = true;
        this.offsetX = this.x - mx;
        this.offsetY = this.y - my;
        selectedTrait = this;
        return true;
      }
    }
    return false;
  }

  released() {
    this.dragging = false;
  }

  isOverResizeHandle(mx, my) {
    let pos = this.getResizeHandlePosition();
    return dist(mx, my, pos.x, pos.y) < this.handleSize;
  }

  isOverRotateHandle(mx, my) {
    let pos = this.getRotateHandlePosition();
    return dist(mx, my, pos.x, pos.y) < this.handleSize;
  }

  drawHandles() {
    let resize = this.getResizeHandlePosition();
    let rotate = this.getRotateHandlePosition();

    push();
    fill(255);
    stroke(0);
    strokeWeight(1);
    ellipse(resize.x, resize.y, this.handleSize);
    ellipse(rotate.x, rotate.y, this.handleSize);
    pop();
  }

  // get...HandlePosition, startResizing, resize, startRotating, rotateTo methods are unchanged.
  getResizeHandlePosition() {
    let angle = this.rotation;
    let x = this.x + cos(angle) * this.width / 2;
    let y = this.y + sin(angle) * this.width / 2;
    return createVector(x, y);
  }

  getRotateHandlePosition() {
    let angle = this.rotation + PI / 2;
    let x = this.x + cos(angle) * this.height / 2;
    let y = this.y + sin(angle) * this.height / 2;
    return createVector(x, y);
  }

  startResizing(mx, my) {
    this.initialDistance = dist(mx, my, this.x, this.y);
    this.initialScale = this.scale;
  }

  resize(mx, my) {
    let newDistance = dist(mx, my, this.x, this.y);
    let scaleFactor = newDistance / this.initialDistance;
    this.scale = constrain(this.initialScale * scaleFactor, 0.1, 1.0);
    this.updateSize();
  }

  startRotating(mx, my) {
    this.initialAngle = atan2(my - this.y, mx - this.x);
    this.initialRotation = this.rotation;
  }

  rotateTo(mx, my) {
    let currentAngle = atan2(my - this.y, mx - this.x);
    this.rotation = this.initialRotation + (currentAngle - this.initialAngle);
  }
}
