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
    loungeChair: loungeChair,
    parasol: parasol,
    planterTree: planterTree,
    pillar: pillar,
    merchStall: merchStall,
    beverageCart: beverageCart
  };

})();
