# Perfect Store Scorecard - Corrected MVP Logic Alignment

## Purpose

Use this document to align the team on the corrected Perfect Store Scorecard MVP logic.

The old prototype formula used SKU Weight, Location Multiplier, Quantity Factor, Season Factor, PY POS, and Velocity as score drivers. That model is no longer the recommended MVP scoring direction unless the business explicitly approves those coefficients.

The corrected MVP should keep the score simple, explainable, and tied to business-approved data.

## Plain-English Rule

Base Plan measures required execution.

Base Plan LGOR measures how much relevant quarterly business is represented by the expected/base plan support.

Incremental / Off-Shelf measures extra display execution beyond the base plan.

Peak Week depth gives extra score credit only when the displayed quantity can support peak demand.

PY POS and Velocity are supporting context for recommendations unless business approves them as score inputs.

## Recommended MVP Formula

```text
Final PSS Score =
Execution Score
+ Base Plan LGOR Points
+ Incremental Off-Shelf Points
```

Where:

```text
Base Plan LGOR Points = Base Plan LGOR %
```

```text
Incremental Item Points =
Incremental SKU LGOR % x Peak Week Multiplier
```

```text
Incremental Off-Shelf Points =
Sum of Incremental Item Points
```

## Separate Business Coverage Metric

The app should also show LGOR Rep % separately from the numeric score.

```text
LGOR Rep % =
Base Plan LGOR %
+ Incremental Raw LGOR %
```

Final Score is for internal ranking and competition.

LGOR Rep % is the simpler business coverage metric for customer or leadership conversations.

## Key Definitions

| Term | Correct MVP Meaning | Score Role |
| --- | --- | --- |
| Execution Score | Required POG/MAP/Stackout setup completion | Part of Final PSS Score |
| Base Plan LGOR % | Quarterly business represented by expected/base plan support | Converted directly into points |
| Incremental / Off-Shelf | Extra displays beyond the base plan | Adds incremental points |
| Peak Week Units | Highest-volume week for Store + SKU + Quarter | Used to calculate multiplier |
| Location | Where the display is placed | Captured for reporting, not scored unless approved |
| Quantity | Field-entered cases/pallets/eaches | Normalized to units for peak-week comparison |
| PY POS | Prior-year point-of-sale units/dollars | Context, not score by default |
| Velocity | SKU sales strength vs baseline | Context unless approved as score input |
| Recommendations | Missing, Not Enough, Empty Calories, Missing MAP | Guidance, not score by default |
| Risk | Demand/shelf-capacity warning | Future-phase metric |

## Execution Score

Execution Score measures whether required store execution was completed.

```text
Execution Score = completed required execution points out of 100
```

Example:

```text
8 required items x 12.5 points = 100 possible points
Completed execution = 85 points
Execution Score = 85
```

Business still needs to confirm partial completion rules:

- Half credit
- Prorated SKU-level credit
- Zero credit for missing required item
- Another approved rule

## Base Plan LGOR Points

Base Plan LGOR Points represent the share of selected quarterly business supported by the base plan.

```text
Base Plan LGOR Points = Base Plan LGOR %
```

Example:

```text
Base Plan LGOR % = 26.3%
Base Plan LGOR Points = 26.3
```

This makes the score business-weighted instead of only checklist-weighted.

## Incremental / Off-Shelf Points

Incremental / Off-Shelf Points represent extra displays added beyond the required plan.

```text
Incremental Item Points =
Incremental SKU LGOR % x Peak Week Multiplier
```

Example:

```text
SKU LGOR % = 7.3
Peak Week Multiplier = 2

Incremental Item Points = 7.3 x 2 = 14.6
```

This replaces the old formula:

```text
SKU Weight x Location Multiplier x Quantity Factor x Season Factor
```

That old formula should not be used as the MVP score unless business approves all weights, multipliers, thresholds, and data sources.

## Peak Week Multiplier

Peak Week Units represent the highest sales-volume week for a Store + SKU + Quarter.

```text
Peak Week Ratio =
Calculated Off-Shelf Units / Peak Week Units
```

Draft MVP multiplier:

```text
If quantity >= 3 x Peak Week Units -> 3x multiplier
If quantity >= 2 x Peak Week Units -> 2x multiplier
If quantity >= 1 x Peak Week Units -> 1x multiplier
If quantity < 1 x Peak Week Units -> 0x multiplier, pending confirmation
```

Example:

```text
Peak Week Units = 50
Calculated Off-Shelf Units = 100

Peak Week Ratio = 100 / 50 = 2x
Peak Week Multiplier = 2
```

Important: 2x peak week does not mean sales will double. It means the display has enough quantity to support two peak weeks of demand, so the score gives 2x credit on that SKU's LGOR value.

## Quantity Handling

Field users may enter quantity in simple operational terms:

- Eaches
- Cases
- Pallets

The calculation should normalize quantity into a consistent unit before comparing it to Peak Week Units.

Example:

```text
Rep enters = 2 pallets
Units per pallet = 120
Calculated Off-Shelf Units = 240

Peak Week Units = 80
Peak Week Ratio = 240 / 80 = 3x
Peak Week Multiplier = 3
```

Needed data fields may include:

- Units per case
- Cases per pallet
- Units per pallet
- Case pack
- Pallet quantity

Product size values like 4 qt, 1 cu ft, 1 sq yd, or 10 lb describe the consumer product. They do not necessarily provide the operational conversion needed for scoring.

## Location Logic

Display location should be captured, but it should not change score in the corrected MVP unless business approves location-based scoring.

Captured locations may include:

- Endcap
- Racetrack
- Garden Door
- Drive Aisle
- Fence Line
- Other

Correct MVP role:

```text
Location = reporting, validation, duplicate checking, and recommendations
```

Not confirmed:

```text
Location = numeric score multiplier
```

## Season Logic

Season can be useful context for recommendations and product priority, but it should not automatically multiply the score unless business approves it.

Correct MVP role:

```text
Season = context for opportunity and recommendations
```

Not confirmed:

```text
Season Factor = numeric score multiplier
```

## PY POS and Velocity

PY POS means Previous Year Point of Sale. It is historical sales data, not a score.

Example:

```text
Store = Home Depot #123
SKU = Turf Builder 10 lb
Quarter = Q1
PY POS = 120 units
```

Velocity compares store/SKU performance against a baseline.

```text
Velocity Factor =
Store SKU POS / Baseline POS
```

Example:

```text
Store SKU PY POS = 120
Baseline POS = 100
Velocity Factor = 1.2
```

Meaning: this SKU historically sold 20% above baseline.

For MVP, PY POS and Velocity should be displayed as supporting context unless business approves direct score impact.

If business later approves Velocity as a score input, it should adjust only Incremental / Off-Shelf Points, not Execution Score or Base Plan LGOR Points.

## Recommendations and Risk

Recommendations should remain separate from the numeric score for MVP.

Recommendation categories:

- Missing
- Not Enough
- Empty Calories
- Missing MAP

Correct MVP role:

```text
Recommendations = guidance / next-best-action
```

Risk should also remain outside the MVP score.

Correct MVP role:

```text
Risk = future-phase warning metric
```

## Correct Example

```text
Execution Score = 100
Base Plan LGOR Points = 26.3

Incremental SKU A LGOR = 7.3
Peak Week Multiplier = 2
Incremental SKU A Points = 14.6

Incremental SKU B LGOR = 8.8
Peak Week Multiplier = 3
Incremental SKU B Points = 26.4

Incremental Off-Shelf Points = 14.6 + 26.4 = 41.0

Final PSS Score = 100 + 26.3 + 41.0 = 167.3

LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %
LGOR Rep % = 26.3 + 16.1 = 42.4%
```

## Business Questions for Confirmation

1. What is the approved LGOR source: dollars, units, POS EA, forecast, prior-year POS, or blended business value?
2. What is the LGOR denominator: selected quarterly business by SKU group, store, banner, cluster, or another grouping?
3. Will Peak Week Units be available by Store + SKU + Quarter?
4. Should peak-week multiplier be exact, floored, bucketed, or capped?
5. Should quantity below 1x peak week earn 0x or partial credit?
6. What source provides units per case, cases per pallet, and units per pallet?
7. What is the approved partial completion rule for execution scoring?
8. Should location ever affect score, or remain reporting-only?
9. Should season ever affect score, or remain recommendation context?
10. Should PY POS / Velocity remain supporting context for MVP?
11. If Velocity is later approved, should it multiply only Incremental Off-Shelf Points?
12. Should recommendations or risk ever create score penalties, or remain guidance-only?

## Final Memory Line

Base Plan = required execution.

LGOR = business share.

Incremental = extra off-shelf execution.

Peak Week = quantity depth against demand.

Location = captured, not scored by default.

Season = context, not scored by default.

PY POS = historical sales.

Velocity = sales strength.

Recommendations and risk = guidance unless business approves score impact.

Final PSS Score = Execution Score + Base Plan LGOR Points + Incremental Off-Shelf Points.

LGOR Rep % = Base Plan LGOR % + Incremental Raw LGOR %.
