# Goal Description

The goal is to build FairLens, an AI Bias Detection and Fairness Audit Platform, utilizing a React (Vite) frontend and a Python (FastAPI/Fairlearn) backend based on the specific aesthetic and layout specified in Google Stitch project ID 4321440369227908644. FairLens will calculate bias metrics like Demographic Parity, Equal Opportunity, and Disparate Impact, and provide mitigations via Reweighing and Threshold adjustment.

## Proposed Changes

We will divide the project into two main directories: `frontend` and `backend`.

### Backend Implementation

#### [NEW] `backend/requirements.txt`
Dependencies: `fastapi`, `uvicorn`, `pandas`, `numpy`, `fairlearn`, `scikit-learn`, `pydantic`, `python-multipart`.

#### [NEW] `backend/models/schemas.py`
Pydantic models for request validation and response serialization (`AuditRequest`, `AuditResponse`, `MitigationRequest`, `MitigationResponse`).

#### [NEW] `backend/services/preprocessor.py`
Handles data cleaning: dropping null targets, filling missing values (median/mode), encoding categorical data, validating columns.

#### [NEW] `backend/services/bias_engine.py`
Accepts a DataFrame and attributes, computes Demographic Parity, Equal Opportunity, and Disparate Impact using Fairlearn and Pandas.

#### [NEW] `backend/routers/audit.py`
Implements the `/audit/run` and `/audit/history` endpoints.

#### [NEW] `backend/services/mitigation_service.py` & `backend/routers/mitigation.py`
Implements Reweighing and Threshold adjustment, returning before/after metrics and Pareto coordinates, exposed via `/audit/mitigate`.

#### [NEW] `backend/main.py`
Wires up the application, configures CORS, and registers routers.

---

### Frontend Implementation

#### [NEW] `frontend/package.json` & Vite Setup
Initialize Vite React project with Tailwind CSS, shadcn/ui, Zustand, React Router v6, Axios, Recharts, and Papaparse.

#### [NEW] `frontend/utils/biasColors.js` & `frontend/mock/mockAuditData.js`
Implement standard RAG logic functions for colors and hardcoded mock responses for early development.

#### [NEW] `frontend/services/`
- `api.js`: Axios instance with `USE_MOCK` toggle.
- `geminiService.js`: Utility for mimicking typewriter output.
- `auditService.js`: Wrapping API calls.

#### [NEW] `frontend/store/`
Zustand stores: `useAuditStore`, `useUploadStore`, `useMitigationStore`.

#### [NEW] `frontend/components/`
- **Layout**: `AppShell`, `Sidebar`, `Topbar`
- **Shared**: `RAGBadge`, `MetricCard`, `HeatmapCell`
- **Charts**: `BiasBarChart`, `GroupComparisonChart`, `ParetoChart` 

#### [NEW] `frontend/pages/`
Building pages in order:
1. `Dashboard.jsx`: 4 metric cards, Gemini panel, Heatmap, Timeline.
2. `MitigationLab.jsx`: Controls and Pareto chart comparison.
3. `ComplianceReport.jsx`: Accordion-based standards checking.
4. `Upload.jsx` & `AttributeSelection.jsx`: Connected flow for dataset configuration.
5. `AuditHistory.jsx`: Data table and summary widgets.
6. `Landing.jsx`: Hero, CTA, integrations strip.

## User Review Required

> [!WARNING]
> Please confirm if any specific styling beyond Tailwind standard defaults is needed before I install and configure shadcn UI layout. 
> The plan uses `USE_MOCK = true` first to build out visuals, and will switch to false when the backend is hooked up. Is this acceptable?

## Verification Plan

### Automated Tests
- N/A for this initial hackathon build (unless specified).

### Manual Verification
1. Run backend server using `uvicorn main:app --reload` and test endpoints via Swagger UI.
2. Run frontend server using `npm run dev`. Navigate via the app UI and check that the Dashboard accurately displays the mock data first, then real data out of the CSV upload flow.
3. Ensure visual styling matches the 'Clinical Architect' design spec.
