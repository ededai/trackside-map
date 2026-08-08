/* ==========================================================================
   TRACKSIDE — PROP LIBRARY  (props.js)
   --------------------------------------------------------------------------
   Standalone builder set for the grey-box motion prototype. Pure DOM/CSS —
   no external resources, no animation loops, no timers. Every builder uses
   ONLY the five helpers handed in via PROPS.init(), plus inline styles, so
   this file has zero dependency on motion-prototype.html's internal state.

   Conventions borrowed from motion-prototype.html section 2 (read there
   first if this file is being extended):
     - el(cls, style, parent)              generic positioned div
     - rect(parent, cls, x, y, w, h, extra) a `.flat` ground-plane rect
     - box(parent, x, y, w, h, z, extra)    a `.box` (plan rect + --h
       extrusion), auto-builds its 3 faces (.f.top / .f.sy / .f.sx). `extra`
       may set --faceT / --faceA / --faceB (top / front-south / side-west)
       as inline custom props — they inherit down into the auto-built faces.
     - shadow(parent, x, y, w, h)           soft `.shd` ground shadow sized
       to a footprint (helper already pads/offsets it)
     - label(parent, x, y, z, text, cls)    billboarded pill label

   Rotation: none of the 5 helpers rotate a footprint, so every builder that
   takes a rotDeg wraps its parts in a local `grp`-style container: a plain
   div, sized to the prop's own footprint, transform-style:preserve-3d,
   rotateZ(rotDeg) about its own centre (default transform-origin 50% 50%).
   Children are then built in footprint-local 0,0..w,h coordinates exactly
   like top-level pieces. This mirrors the `grp()` helper already used in
   motion-prototype.html for rotated sub-plans.
   CAVEAT inherited from that same convention: a .box's auto-built side pair
   (sy/sx) is only the CORRECT visible pair while (camera rz + this prop's
   rotDeg) stays inside roughly (-90deg, 0deg). Keep placement rotDeg values
   inside that window for any pose that is meant to show the prop face-on.

   Colour: default props stay on the CSS file's own grey defaults (no face
   override passed). Colour-bearing props (supercar body/cabin, merch stall)
   go through shadeStyle(), which derives a lighter top / darker front shade
   from one base colour with color-mix() — same directional-light logic the
   stylesheet already uses for its default greys (top lightest, front-south
   darkest, side-west mid).

   ---- BUILDER FOOTPRINTS (plan px, before any rotation) -------------------
     supercar(parent,x,y,rotDeg,color)   ~46 x 22   body h12, cabin h9 (on roof)
     realCar(parent,x,y,rotDeg,model,colour) ~46 x 20  see REAL CAR notes below
     loungeChair(parent,x,y,rotDeg)      ~16 x 14   seat h5, reclined back panel
     parasol(parent,x,y)                 ~30 x 30   canopy disc, pole h40
     planterTree(parent,x,y)             ~24 x 24   canopy disc, trunk h20
     pillar(parent,x,y)                  ~10 x 10   column h40
     merchStall(parent,x,y,rotDeg)       ~60 x 30   counter h14, back wall h34
     beverageCart(parent,x,y,rotDeg)     ~34 x 22   counter h13, canopy on 2 posts
   ========================================================================== */
"use strict";
(function () {

  var H = null;   /* { el, rect, box, shadow, label } — set by init() */

  /* -- local helpers (not exposed) ---------------------------------------- */

  /* rotated local-coordinate container, same pattern as motion-prototype's
     grp(): a plain div sized to (w,h), centred at (cx,cy), rotateZ(deg)
     about its own centre. --crzx hands any nested label() the counter-spin
     it needs to stay screen-horizontal, matching the existing convention. */
  function wrap(parent, cx, cy, w, h, deg) {
    deg = deg || 0;
    var t = deg ? ('transform:rotateZ(' + deg + 'deg);--crzx:' + (-deg) + 'deg;') : '';
    return H.el('grp',
      'position:absolute;left:' + (cx - w / 2) + 'px;top:' + (cy - h / 2) + 'px;width:' + w +
      'px;height:' + h + 'px;transform-style:preserve-3d;' + t, parent);
  }

  /* directional-light shade triple from one base colour, matching the
     stylesheet's own default relation (top lightest, front-south darkest,
     side-west mid). Pure CSS color-mix() — no external resources. */
  function shadeStyle(base) {
    return '--faceT:color-mix(in srgb, ' + base + ' 80%, white);' +
           '--faceB:' + base + ';' +
           '--faceA:color-mix(in srgb, ' + base + ' 78%, black);';
  }

  var DARK_METAL = '--faceT:#4a4e52;--faceA:#2c2f32;--faceB:#3a3d41;';
  var BARK       = '--faceT:#8a7256;--faceA:#5c4a36;--faceB:#6f5a42;';

  /* tinted glasshouse — same face triple relation as shadeStyle, but fixed
     dark so glass never picks up the body colour. GLASS_FLAT is the matching
     fill for `.flat` leaves (roof/backlight panels lying at a translateZ). */
  var GLASS      = '--faceT:#39424b;--faceA:#212830;--faceB:#2b333b;';
  var GLASS_FLAT = '#333c45';

  /* one-line color-mix, same form the stylesheet + shadeStyle already use.
     pct = how much of `c` survives, remainder is `other`. */
  function mix(c, other, pct) {
    return 'color-mix(in srgb, ' + c + ' ' + pct + '%, ' + other + ')';
  }

  /* ==========================================================================
     BUILDERS
     ========================================================================== */

  /* supercar — low body + set-back cabin (stepped massing stands in for a
     wedge silhouette in this grey-box pass) + 4 dark wheel blocks.
     Footprint ~46 x 22. color is the body's base shade; wheels stay dark
     regardless. */
  function supercar(parent, x, y, rotDeg, color) {
    var base = color || '#8a9096';
    var W = 46, D = 22;
    var w = wrap(parent, x, y, W, D, rotDeg);
    H.shadow(w, 0, 0, W, D);
    var shade = shadeStyle(base);
    /* body: low slab, inset slightly from the footprint edges */
    H.box(w, 3, 3, W - 6, D - 6, 12, shade);
    /* cabin: narrower + shorter, set back toward the rear third, sat on
       the body's roof via translateZ(12) = the body's own extrusion height */
    H.box(w, 15, 5, 18, D - 10, 9, shade + 'transform:translateZ(12px);');
    /* 4 wheels: dark low blocks at the corners */
    H.box(w, 1,     1,     6, 6, 5, DARK_METAL);
    H.box(w, W - 7, 1,     6, 6, 5, DARK_METAL);
    H.box(w, 1,     D - 7, 6, 6, 5, DARK_METAL);
    H.box(w, W - 7, D - 7, 6, 6, 5, DARK_METAL);
  }

  /* ==========================================================================
     REAL CAR  —  recognisable stylised models
     --------------------------------------------------------------------------
     Footprint ~46 x 20 plan px (10px = 1m, so 4.6m long / 1.7m wide / ~1.35m
     tall — real proportions). LOCAL AXES, before the wrap's rotateZ:

         x = 0 .......... TAIL            x = 46 ......... NOSE
         y = 0 (north edge) ... y = 20 (south edge)

     At the default camera (rotateX 58 / rotateZ -38) the visible quads are the
     TOP, the SOUTH flank (--faceA) and the WEST end (--faceB) — i.e. with the
     nose at +x the TAIL faces the viewer, which is where every model carries
     its loudest cue (wing / ducktail / lip spoiler / taillights).

     MASSING RECIPE shared by all four models:
       1  soft ground shadow
       2  rocker/sill box   — the "darker base layer", shadeStyle() of a
                              blackened base, z 0 -> ~3
       3  main body box     — shadeStyle(colour); its own .f.top IS the
                              "lighter top deck", z ~3 -> beltline
       4  shaping leaves    — `.flat` rects with border-radius at translateZ,
                              parked +0.05px above the box top so they never
                              z-fight the face they sit on. These carry the
                              PLAN silhouette, which is what actually reads
                              from a 58deg top-down camera.
       5  greenhouse box    — GLASS face triple, sat on the beltline
       6  model cue parts   — wing / lip / taillights
       7  4 dark wheel blocks, ~2.5px proud of the body sides

     MODEL CUES
       r34    boxy square-cut body, short front + rear decks, upright
              greenhouse, LARGE rear wing on two struts raised ABOVE roof
              height, twin round red taillights on a vertical tail panel.
       911    heavy elliptical nose + rounded tail, a flared rear haunch leaf
              wider than the body, a dark backlight leaf running from the roof
              down over the rear deck (fastback teardrop), small ducktail lip,
              NO wing.
       r35    widest + tallest of the set, square corners everywhere, angular
              bonnet leaf, chunky square tail, low straight wing on two short
              stand-offs sat BELOW roof height.
       silvia lowest body, long flat bonnet leaf ending in a true elliptical
              point, slim greenhouse pushed rearward, thin boot lip spoiler.
     ========================================================================== */

  /* 4 dark wheel blocks. rx/fx = rear + front axle x, ny/sy = north + south
     wheel y (set outside the body's own y range so they read as proud). */
  function wheels(w, rx, fx, ny, sy, ww) {
    H.box(w, rx, ny, ww, 4, 4.5, DARK_METAL);
    H.box(w, rx, sy, ww, 4, 4.5, DARK_METAL);
    H.box(w, fx, ny, ww, 4, 4.5, DARK_METAL);
    H.box(w, fx, sy, ww, 4, 4.5, DARK_METAL);
  }

  /* a radius-shaped leaf: `.flat` rect with a border-radius and a fill,
     floated to z. This is the only way to get a rounded PLAN outline — a
     .box's faces are separate quads and ignore the box's own radius. */
  function leaf(w, x, y, ww, hh, z, fill, radius) {
    return H.rect(w, '', x, y, ww, hh,
      'background:' + fill + ';border-radius:' + radius +
      ';transform:translateZ(' + z + 'px)');
  }

  function realCar(parent, x, y, rotDeg, model, colour) {
    var base = colour || '#8a9096';
    var W = 46, D = 20;
    var w = wrap(parent, x, y, W, D, rotDeg);
    H.shadow(w, 0, 0, W, D);

    var body = shadeStyle(base);                    /* main volume          */
    var sill = shadeStyle(mix(base, 'black', 74));  /* darker base layer    */
    var deck = mix(base, 'white', 84);              /* lighter top deck     */
    var hump = mix(base, 'white', 90);              /* haunch / boot deck   */
    var trim = mix(base, 'black', 80);              /* wings + lips         */
    var m = model || 'r34';

    if (m === '911') {
      /* --- PORSCHE 911 (996/997) — rounded, fastback, no wing ------------ */
      H.box(w, 5, 3.5, W - 10, D - 7, 3, sill);
      H.box(w, 3, 2, W - 6, D - 4, 6, body + 'transform:translateZ(3px);');
      /* full-length silhouette leaf: elliptical nose (11 x 8 radius on a
         16-tall leaf = a true half-ellipse), softly rounded tail */
      leaf(w, 1, 2, 44, 16, 9.05, deck, '6px 11px 11px 6px / 6px 8px 8px 6px');
      /* rear haunch leaf — 18 wide against the body's 16: wider at the rear */
      leaf(w, 0.5, 1, 19, 18, 9.1, hump, '7px 3px 3px 7px');
      /* greenhouse, then a dark backlight leaf sloping out over the rear
         deck — the two dark shapes merge into one teardrop = fastback */
      H.box(w, 15, 4.5, 14, 11, 3.5, GLASS + 'transform:translateZ(9px);');
      leaf(w, 5, 5, 26, 10, 11, GLASS_FLAT, '5px 3px 3px 5px');
      /* ducktail: a lip, not a wing — barely above the deck */
      leaf(w, 1.5, 3, 6, 14, 10.2, trim, '4px 1px 1px 4px');
      wheels(w, 3, 33, -0.5, 16.5, 7);

    } else if (m === 'r35') {
      /* --- NISSAN GT-R R35 — wide, angular, low straight wing ------------ */
      H.box(w, 2.5, 2.5, W - 5, D - 5, 4, sill);
      /* widest + tallest body of the set, square corners throughout */
      H.box(w, 1.5, 1.5, W - 3, D - 3, 5.5, body + 'transform:translateZ(4px);');
      /* angular bonnet leaf — deliberately tiny radii next to the 911's */
      leaf(w, 25, 2, 20, 16, 9.55, deck, '1px 4px 4px 1px');
      H.box(w, 10, 4, 16, 12, 4, GLASS + 'transform:translateZ(9.5px);');
      /* two SHORT stand-offs -> the wing sits at z 12, below the 13.5 roof */
      H.box(w, 4, 4.5,  2.5, 2, 2.5, DARK_METAL + 'transform:translateZ(9.5px);');
      H.box(w, 4, 13.5, 2.5, 2, 2.5, DARK_METAL + 'transform:translateZ(9.5px);');
      leaf(w, 1.5, 1, 8, 18, 12, trim, '1.5px');
      wheels(w, 4, 32, -1, 17, 8);

    } else if (m === 'silvia') {
      /* --- NISSAN SILVIA S15 — low wedge, long bonnet, pointed nose ------ */
      H.box(w, 4, 4, W - 8, D - 8, 2.5, sill);
      /* lowest beltline in the set (z 7 vs the R35's 9.5) */
      H.box(w, 2.5, 3, W - 5, D - 6, 4.5, body + 'transform:translateZ(2.5px);');
      /* long flat bonnet — half the car — ending in a 13 x 6.5 radius on a
         13-tall leaf, i.e. a full half-ellipse = pointed nose */
      leaf(w, 21, 3.5, 23, 13, 7.05, deck,
           '1px 13px 13px 1px / 1px 6.5px 6.5px 1px');
      /* slim greenhouse pushed rearward: only 6px of boot behind it */
      H.box(w, 7.5, 5, 13.5, 10, 3.5, GLASS + 'transform:translateZ(7px);');
      leaf(w, 2.5, 4, 6.5, 12, 7.05, hump, '4px 1px 1px 4px');
      /* thin boot lip spoiler — 1px of stand-off, no struts */
      leaf(w, 2.5, 3.5, 3.5, 13, 8, trim, '3px 1px 1px 3px');
      wheels(w, 5, 31, 0.5, 15.5, 7);

    } else {
      /* --- NISSAN SKYLINE GT-R R34 — boxy, big wing, round taillights ---- */
      H.box(w, 3, 3, W - 6, D - 6, 3.5, sill);
      /* square-cut slab, no shaping leaf at all: the R34 IS the box */
      H.box(w, 2, 2, W - 4, D - 4, 6, body + 'transform:translateZ(3.5px);');
      /* upright greenhouse, short decks either side (16 front / 8 rear) */
      H.box(w, 11, 3.5, 17, 13, 4, GLASS + 'transform:translateZ(9.5px);');
      /* THE giveaway: two tall struts off the boot carrying a large blade
         at z 15.5 — 2px clear ABOVE the 13.5 roofline */
      H.box(w, 4.5, 4,    2.5, 2.5, 6, DARK_METAL + 'transform:translateZ(9.5px);');
      H.box(w, 4.5, 13.5, 2.5, 2.5, 6, DARK_METAL + 'transform:translateZ(9.5px);');
      leaf(w, 1.5, 1.5, 8, 17, 15.5, trim, '2px');
      /* twin round taillights: ONE vertical panel standing on the tail,
         hinged exactly like a .box's own .f.sx west quad (transform-origin
         0% 50% + rotateY(-90deg) maps the element's width axis onto +z, so
         translateX after the rotation lifts it to z 6..9.6). Both lamps are
         painted with radial-gradients so the pair costs a single node.
         left:1.7 keeps it 0.3px proud of the body's own west face at x=2. */
      H.rect(w, '', 1.7, 3, 3.6, 14,
        'transform-origin:0% 50%;transform:rotateY(-90deg) translateX(6px);' +
        'background:' +
        'radial-gradient(circle at 50% 18%, #e6483c 0 1.5px, rgba(0,0,0,0) 1.6px),' +
        'radial-gradient(circle at 50% 82%, #e6483c 0 1.5px, rgba(0,0,0,0) 1.6px),' +
        '#2b3034;border-radius:1px');
      wheels(w, 5, 32, -0.5, 16.5, 7);
    }
    return w;
  }

  /* loungeChair — seat slab + a reclined backrest panel hinged off the
     seat's rear edge (same hinged-flat-panel technique the prototype uses
     for standing screens, just rotated past vertical for a recline).
     Footprint ~16 x 14. */
  function loungeChair(parent, x, y, rotDeg) {
    var W = 16, D = 14;
    var w = wrap(parent, x, y, W, D, rotDeg);
    H.shadow(w, 0, 0, W, D);
    /* seat: occupies the front (south) two-thirds of the footprint */
    H.box(w, 0, 5, W, D - 5, 5);
    /* backrest: hinged at the seat's rear edge (local y=5), reclined past
       vertical by rotating beyond 90deg so it leans back and away */
    H.el('fade',
      'position:absolute;left:0px;top:-7px;width:' + W + 'px;height:12px;' +
      'transform-origin:50% 100%;transform:translateZ(5px) rotateX(-118deg);' +
      'transform-style:preserve-3d;background:#c7cbce;border:1px solid rgba(0,0,0,.06)',
      w);
  }

  /* parasol — thin dark pole + a round canvas canopy (a `.flat` rect with
     border-radius:50%, lifted to pole height). No rotation: symmetric.
     Footprint ~30 x 30 (canopy diameter). */
  function parasol(parent, x, y) {
    var R = 15;
    H.shadow(parent, x - R, y - R, R * 2, R * 2);
    H.box(parent, x - 2, y - 2, 4, 4, 40, DARK_METAL);
    H.rect(parent, '', x - R, y - R, R * 2, R * 2,
      'background:#e2d4b6;border-radius:50%;transform:translateZ(40px);' +
      'box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)');
  }

  /* planterTree — trunk block + a round green canopy disc, lifted above the
     trunk the same way parasol lifts its canvas. No rotation: symmetric.
     Footprint ~24 x 24 (canopy diameter). */
  function planterTree(parent, x, y) {
    var R = 12;
    H.shadow(parent, x - R, y - R, R * 2, R * 2);
    H.box(parent, x - 3, y - 3, 6, 6, 20, BARK);
    H.rect(parent, '', x - R, y - R, R * 2, R * 2,
      'background:#6fa876;border-radius:50%;transform:translateZ(26px);' +
      'box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)');
  }

  /* pillar — dark square column on a sparse structural grid.
     Footprint ~10 x 10, height ~40. No rotation: square + symmetric. */
  function pillar(parent, x, y) {
    var S = 10;
    H.shadow(parent, x - S / 2, y - S / 2, S, S);
    H.box(parent, x - S / 2, y - S / 2, S, S, 40, DARK_METAL);
  }

  /* merchStall — purple-tinted counter (low, front edge) + back wall
     (taller, rear edge). Landmark anchor prop; caller adds its own label()
     at the placement site. Footprint ~60 x 30. */
  function merchStall(parent, x, y, rotDeg) {
    var W = 60, D = 30;
    var w = wrap(parent, x, y, W, D, rotDeg);
    H.shadow(w, 0, 0, W, D);
    var shade = shadeStyle('#8f6bb3');
    /* counter along the front (south) edge */
    H.box(w, 2, D - 12, W - 4, 10, 14, shade);
    /* back wall along the rear (north) edge, taller */
    H.box(w, 2, 0, W - 4, 6, 34, shade);
  }

  /* beverageCart — small serving counter with a flat canopy on two thin posts
     and a couple of cup dots sat on the counter top. Informal F&B point for
     the B1 lounge. Footprint ~34 x 22. */
  function beverageCart(parent, x, y, rotDeg) {
    var W = 34, D = 22;
    var w = wrap(parent, x, y, W, D, rotDeg);
    H.shadow(w, 0, 0, W, D);
    /* counter body, inset from the footprint so the canopy oversails it */
    H.box(w, 3, 7, W - 6, D - 11, 13,
      '--faceT:#e0e4e7;--faceA:#c1c7cc;--faceB:#ccd1d6;');
    /* two cup dots on the counter top (counter extrudes to z 13) */
    H.rect(w, '', 10, 12, 4, 4,
      'background:#8f6bb3;border-radius:50%;transform:translateZ(13.6px)');
    H.rect(w, '', 18, 14, 4, 4,
      'background:#c8834a;border-radius:50%;transform:translateZ(13.6px)');
    /* two thin posts carrying a flat canopy over the whole footprint */
    H.box(w, 3,     2, 3, 3, 30, DARK_METAL);
    H.box(w, W - 6, 2, 3, 3, 30, DARK_METAL);
    H.rect(w, '', 0, 0, W, D,
      'background:#ded2bd;border-radius:3px;transform:translateZ(30px);' +
      'box-shadow:inset 0 0 0 1px rgba(0,0,0,.06)');
  }

  /* ==========================================================================
     PUBLIC API
     ========================================================================== */
  window.PROPS = {
    init: function (helpers) { H = helpers; },
    supercar: supercar,
    realCar: realCar,
    loungeChair: loungeChair,
    parasol: parasol,
    planterTree: planterTree,
    pillar: pillar,
    merchStall: merchStall,
    beverageCart: beverageCart
  };

})();
