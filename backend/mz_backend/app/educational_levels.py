"""
The fixed educational-level classification for the "Toys & Educational" category.

Ids are fixed, readable strings (not random), so the seed can run any number of
times without ever creating a duplicate level.
Format: (group name, [(level id, level name), ...]) in display order.
"""
EDUCATIONAL_LEVEL_GROUPS = [
    ("Early Learning", [
        ("early-ukg", "UKG"),
        ("early-class-1-2", "Class 1–2"),
        ("early-class-3-5", "Class 3–5"),
    ]),
    ("Middle School", [
        ("middle-class-6-8", "Class 6–8"),
    ]),
    ("Secondary School", [
        ("secondary-class-9-10", "Class 9–10"),
    ]),
    ("Senior Secondary", [
        ("senior-class-11-12", "Class 11–12"),
    ]),
    ("Diploma and Undergraduate", [
        ("ug-diploma", "Diploma"),
        ("ug-bsc", "B.Sc."),
        ("ug-btech-be", "B.Tech / B.E."),
        ("ug-other", "Other Undergraduate Programmes"),
    ]),
    ("Postgraduate", [
        ("pg-msc", "M.Sc."),
        ("pg-mtech-me", "M.Tech / M.E."),
        ("pg-other", "Other Postgraduate Programmes"),
    ]),
    ("Research and Advanced Projects", [
        ("res-phd", "PhD / Research Projects"),
        ("res-prototyping", "Advanced Prototyping"),
        ("res-professional", "Professional and Advanced Development"),
    ]),
]
