import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { writeFileSync } from "node:fs";
import { PipRig } from "../src/PipRig";
writeFileSync("public/brand/pip-rig.svg", renderToStaticMarkup(<PipRig />));
