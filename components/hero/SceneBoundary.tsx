"use client";

import { Component } from "react";
import type { ReactNode } from "react";

interface SceneBoundaryProps {
  children: ReactNode;
}

interface SceneBoundaryState {
  failed: boolean;
}

// A refused WebGL context or a failed chunk download only costs the 3D layer. The CSS
// backdrop and poster stay in place, and the hero text was never in the canvas.
export default class SceneBoundary extends Component<SceneBoundaryProps, SceneBoundaryState> {
  state: SceneBoundaryState = { failed: false };

  static getDerivedStateFromError(): SceneBoundaryState {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
