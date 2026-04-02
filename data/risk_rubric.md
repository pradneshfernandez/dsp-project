# ISO 21434 Risk Scoring Rubric

## 1. Impact Categories (S, F, O, P)
Assign a score from 1 (Negligible) to 4 (Severe) for each:
* **Safety (S):** 1: No injury | 4: Life-threatening/Fatal.
* **Financial (F):** 1: < $100 | 4: Major corporate loss/Brand damage.
* **Operational (O):** 1: Minor glitch | 4: Vehicle immobilization.
* **Privacy (P):** 1: Anonymous data | 4: PII/Driver tracking.

## 2. Attack Feasibility (AF)
How easy is the hack?
* **High (1):** Needs basic skills, cheap tools (e.g., OBD-II dongle), and < 1 day.
* **Medium (2):** Needs specialized automotive tools and a few weeks.
* **Low (3):** Needs expert hardware reverse-engineering and months.
* **Very Low (4):** Theoretically possible but requires nation-state resources.

## 3. Risk Calculation Logic
The final Risk Level (1-4) is determined by the intersection of the **Highest Impact Score** and the **Feasibility Score**.
* **Critical (4):** High Impact + High Feasibility.
* **Medium (2-3):** Moderate levels.
* **Low (1):** Low Impact or Very Low Feasibility.