# bydkss

A single-file page: the **Bento** portfolio composition (light theme) with **Soffit**, an animated WebGL2 gradient, showing through its three dark cells as one continuous field.

- `index.html`: the whole page (HTML, CSS and JavaScript). No build step, no dependencies. Open it in a browser or serve the folder as-is.

## Changing it

- **Colours and motion of the gradient:** edit `CONFIG` near the top of the second `<script>`. Never edit the shader to recolour it.
- **Layout measurements:** the custom properties in `:root`, restated per breakpoint in the `RESPONSIVE` block.
- Press **R** to replay the entry cascade.

Without WebGL2 the three cells fall back to the design's own grey ramp.
