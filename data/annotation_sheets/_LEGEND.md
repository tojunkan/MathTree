# 标注符号约定

## 语义角色
| 标记 | 含义 |
|------|------|
| [AS] | assumption — 前提/假设 |
| [DF] | definition — 定义 |
| [CL] | conclusion — 结论 |
| [CD] | condition — 分类讨论 |
| [EQ] | equivalence — 等价/充要 |
| [QT] | quantified — 量词句 |
| [XX] | 其他（请注） |

## 边
| 写法 | 含义 |
|------|------|
| --implies--> | 逻辑推出 |
| --equivalent--> | 等价 |
| --define--> | 定义产出 |
| --case--> | 分类讨论分叉 |

## Scope
`Scope("名称", kind) { ... }`
kind: let_bind | cases | conditional | reductio

## 悬置缩写
| 缩写 | 含义 |
|------|------|
| DSP | display_math (纯显示公式) |
| AMB | ambiguous (多触发词冲突) |
| UCL | unclassified (无法分类) |
| EQF | equivalence flag |
| HAC | has_assumption_context |
| UEX | unique_existence |
