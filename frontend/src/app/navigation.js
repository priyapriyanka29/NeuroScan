import {
  Gauge,
  ScanLine,
  History,
  BrainCircuit,
  SlidersHorizontal,
} from "lucide-react";

/**
 * Sidebar navigation. `match` lists the routes that should light this item up —
 * results and Grad-CAM belong to the analysis workspace.
 */
export const APP_NAV = [
  {
    title: "Workspace",
    items: [
      { to: "/app", label: "Overview", icon: Gauge, end: true, match: ["/app"] },
      {
        to: "/app/analyze",
        label: "MRI Analysis",
        icon: ScanLine,
        match: ["/app/analyze", "/app/results", "/app/gradcam"],
      },
      { to: "/app/history", label: "Analysis History", icon: History, match: ["/app/history"] },
    ],
  },
  {
    title: "System",
    items: [
      { to: "/app/insights", label: "Model Insights", icon: BrainCircuit, match: ["/app/insights"] },
      { to: "/app/settings", label: "Settings", icon: SlidersHorizontal, match: ["/app/settings"] },
    ],
  },
];

/** Topbar heading + supporting line for each route. */
export const PAGE_META = {
  "/app": { title: "Overview", subtitle: "Session snapshot and system status" },
  "/app/analyze": { title: "MRI Analysis", subtitle: "Upload a T1-weighted brain scan for classification" },
  "/app/results": { title: "Prediction Results", subtitle: "Classification output and score distribution" },
  "/app/gradcam": { title: "Grad-CAM Explainability", subtitle: "Attention map for the current scan" },
  "/app/history": { title: "Analysis History", subtitle: "Scans analysed in this browser session" },
  "/app/insights": { title: "Model Insights", subtitle: "Architecture, classes and verified metrics" },
  "/app/settings": { title: "Settings", subtitle: "Connection, motion and session data" },
};

/** The four clinical stages reported by the backend (`constraints.classes`). */
export const STAGE_META = {
  NonDemented: {
    label: "Non-Demented",
    color: "#34D399",
    summary: "Cognitively unimpaired brain morphology with intact cortical thickness and bilateral hippocampal integrity.",
    biomarkers: "Preserved ventricular boundaries, symmetrical temporal structures, standard gray-white matter junction.",
    interpretation: "Cognitively normal — preserved bilateral cortical thickness and ventricular boundaries.",
  },
  VeryMildDemented: {
    label: "Very Mild Demented",
    color: "#FBBF24",
    summary: "Early prodromal stage (often correlating with Mild Cognitive Impairment) with subtle localized atrophy.",
    biomarkers: "Initial micro-atrophy in entorhinal cortex, subtle widening of temporal horn sulci.",
    interpretation: "Very mild impairment — early prodromal atrophy concentrated in entorhinal cortex.",
  },
  MildDemented: {
    label: "Mild Demented",
    color: "#FB923C",
    summary: "Clinically noticeable memory decline with progressive neurodegeneration across parietal and temporal lobes.",
    biomarkers: "Distinct bilateral hippocampal volume loss, moderate lateral ventricular enlargement.",
    interpretation: "Mild impairment — moderate hippocampal volume loss and temporal horn enlargement.",
  },
  ModerateDemented: {
    label: "Moderate Demented",
    color: "#F87171",
    summary: "Advanced stage with extensive neurodegenerative loss, cortical thinning and pronounced ventriculomegaly.",
    biomarkers: "Substantial global atrophy, pronounced sulcal widening, severe ventricular expansion.",
    interpretation: "Moderate impairment — severe ventriculomegaly and generalized cerebral atrophy.",
  },
};

export const STAGE_ORDER = ["NonDemented", "VeryMildDemented", "MildDemented", "ModerateDemented"];

export const stageColor = (cls) => STAGE_META[cls]?.color ?? "#22D3EE";
