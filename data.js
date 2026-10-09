// Source of truth: live vtechwindows.com UPVC WINDOWS menu + product pages (audited 2026-10-09).
// Only facts published on those pages are used. Shared by build.js (static HTML) and documented here.
const B = 'https://vtechwindows.com/';
module.exports.PRODUCTS = [
  {
    id: 'inward-outward-opening-windows', group: 'casement', model: 'inout',
    name: 'Inward Outward Opening Windows', url: B + 'inward-outward-opening-windows-html/',
    desc: 'Hollow, multi-chambered uPVC profiles with segregated drainage and galvanised steel reinforcement. Outward-opening units save interior space and leave the internal sill usable, and the opening can be restricted for added security.',
    features: ['Mitred glazing beads for a cleaner finish', 'Single or double glazing', 'EPDM weather and glazing seals', 'Corrosion-resistant fittings', 'Pile seals and single- or multi-point locks help keep out dust'],
    specs: [['Frame wall', 'approx. 2.0 mm'], ['Steel reinforcement (outward)', '1.2 – 3.0 mm']],
    photos: [[B + 'wp-content/uploads/2023/10/everest-ltd_upvc-tilt-and-turn-windows-1_photo_2_cb-tiltturn-2-640x522-1.jpg.webp', 'Inward opening uPVC window, photo from VTech product page'], [B + 'wp-content/uploads/2023/10/vtech-outward-opening-window-640x522-1.jpg.webp', 'Outward opening uPVC window, photo from VTech product page']],
  },
  {
    id: 'top-hung-casement-window', group: 'casement', model: 'tophung',
    name: 'Top Hung Casement Window', url: B + 'top-hung-casement-window-html/',
    desc: 'A casement window hinged along the top edge. VTech describes precision manufacturing with multiple quality inspections before dispatch, with colour options and customisation.',
    features: ['Precision manufacturing', 'Multiple quality inspections before dispatch', 'Colour options and customisation'],
    specs: [],
  },
  {
    id: 'tilt-and-turn-casement-window', group: 'casement', model: 'tilt',
    name: 'Tilt and Turn Casement Window', url: B + 'tilt-and-turn-casement-window-html/',
    desc: 'Opens normally on side hinges or tilts inward at the top. The tilt position provides draft-free ventilation and weather protection.',
    features: ['Side-hinged turn and top tilt in one window', 'Weldable TPE seal on corners', 'Low heat transmission'],
    specs: [['System', '70 mm casement'], ['Uf value', '1.4 W/m²K'], ['Sound reduction', '43 dB'], ['Profile standard', 'EN 12608'], ['Weathering', '6,000 h xenon arc test, no notable colour change']],
  },
  {
    id: 'fixed-glazing-casement-window', group: 'casement', model: 'fixed',
    name: 'Fixed Glazing Casement Window', url: B + 'fixed-glazing-casement-window-html/',
    desc: 'A fixed pane set directly into the frame for uninterrupted views. VTech highlights design, quality, colour scheme and personalisation across its range.',
    features: ['Firm construction with an elegant design', 'Colour options and customisation'],
    specs: [],
  },
  {
    id: 'french-door', group: 'french', model: 'french',
    name: 'French Door', url: B + 'french-door-html/',
    desc: 'Full-height glass panes in a stylish, long-lasting and smooth-operating door, available in standard and custom sizes for commercial and residential buildings.',
    features: ['Energy efficient, which can lower electricity bills', 'Blocks rainwater seepage', 'Insulates against noise, heat and dust', 'Various colours, designs and hardware', 'Low maintenance and termite proof'],
    specs: [],
  },
  {
    id: 'multi-sliding-doors', group: 'multi', model: 'multi',
    name: 'Multi Sliding Doors', url: B + 'multi-sliding-doors-html/',
    desc: 'Multiple movable panels aligned in a row glide smoothly and stack side by side when open. Often called panoramic doors, for a wider view, more fresh air and natural light.',
    features: ['Panels glide on multiple tracks', 'Panels stack side by side when open', 'Wider view, more fresh air and natural light'],
    specs: [],
  },
  {
    id: 'two-track-sliding-windows', group: 'sliding', model: 'two',
    name: 'Two Track Sliding Windows', url: B + 'two-track-sliding-windows-html/',
    desc: 'Two-track uPVC sliding windows, with years of manufacturing experience behind an extensive selection.',
    features: ['Stainless steel axle', 'Saves interior space', 'Allows more sunlight', 'Provides a panoramic view'],
    specs: [],
  },
  {
    id: 'three-track-sliding-windows', group: 'sliding', model: 'three',
    name: 'Three Track Sliding Windows', url: B + 'three-track-sliding-windows-html/',
    desc: 'A broad variety of three-track uPVC sliding windows, built on years of experience with this window type.',
    features: ['Freely functioning windows', 'Durable', 'Improved breeze and better ventilation', 'Spotless finish'],
    specs: [],
  },
  {
    id: 'monorail-sliding-windows', group: 'sliding', model: 'mono',
    name: 'Monorail Sliding Windows', url: B + 'monorail-sliding-windows-html/',
    desc: 'An ample array of uPVC monorail sliding windows, a type VTech specialises in.',
    features: ['Easy to lock and unlock', 'Multifunctional crest', 'Stunning outer show', 'Modern colour range'],
    specs: [],
  },
  {
    id: 'fly-mesh-sliding-windows', group: 'sliding', model: 'fly',
    name: 'Fly Mesh Sliding Windows', url: B + 'fly-mesh-sliding-windows-html/',
    desc: 'Casement-style windows with fly mesh shutters only, which can be fixed alongside other windows.',
    features: ['Single and double sheath', 'Horizontal unlocking pattern', 'Unbreakable plastic frame material'],
    specs: [['Glass type', '5 mm – 12 mm'], ['Thickness', '2.5 mm PVC']],
  },
];
module.exports.GROUPS = [
  { id: 'casement', name: 'Casement Windows', quote: 'Casement Windows' },
  { id: 'french', name: 'French Door', quote: 'French Door' },
  { id: 'multi', name: 'Multi Sliding Doors', quote: 'Multi Sliding Doors' },
  { id: 'sliding', name: 'Sliding Windows', quote: 'Sliding Windows' },
];
