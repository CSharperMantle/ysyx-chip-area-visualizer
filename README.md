# ysyx-chip-area-visualizer

Y Chip Area Visualizer: Visualize [Yosys](https://github.com/YosysHQ/yosys) [`stat`](https://yosyshq.readthedocs.io/projects/yosys/en/stable/cmd/stat.html) reports.

Originally designed for [my **Y**SYX project](https://github.com/CSharperMantle/ics2023), it can be generalized to any compatible [**Y**osys](https://github.com/YosysHQ/yosys) outputs. Currently this app accepts:

* `synth_stat.txt` ([example](/assets/synth_stat.txt))
* JSON ([example](/assets/input.json))

They can be generated by Yosys commands:

```tcl
tee -o synth_stat.txt stat -liberty $LIB_FILE
tee -o input.json stat -liberty $LIB_FILE -json
```

This app uses [D3.js](https://d3js.org/) for visualization, and [React](https://react.dev/) for DOM manipulation. The animations are powered by [CSS transitions](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_transitions) in SVG, without using third-party animation libraries. It can also serve as an example of writing modern, declarative visualizations combining D3.js and JSX.

## Build

```sh
yarn install --immutable
yarn build
```

## License

Copyright &copy; 2025 Rong "Mantle" Bao <<webmaster@csmantle.top>>.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but **WITHOUT ANY WARRANTY**; without even the implied warranty of **MERCHANTABILITY** or **FITNESS FOR A PARTICULAR PURPOSE**. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
