RANK_VALUES = frozenset({
    "Academy Student", "Genin", "Chunin", "Special Jonin", "Jonin",
    "Anbu", "Kage", "N/A",
})

RANK_ORDER = [
    "Academy Student", "Genin", "Chunin", "Special Jonin", "Jonin",
    "Anbu", "Kage",
]

KKG_CATEGORIES = frozenset({
    "Dojutsu", "Nature Transformation", "Body Enhancement", "Other",
})

KKG_TO_CATEGORY = {
    "sharingan": "Dojutsu",
    "mangekyō sharingan": "Dojutsu",
    "mangekyo sharingan": "Dojutsu",
    "eternal mangekyō sharingan": "Dojutsu",
    "byakugan": "Dojutsu",
    "rinnegan": "Dojutsu",
    "tenseigan": "Dojutsu",
    "magnet release": "Nature Transformation",
    "lava release": "Nature Transformation",
    "boil release": "Nature Transformation",
    "wood release": "Nature Transformation",
    "ice release": "Nature Transformation",
    "storm release": "Nature Transformation",
    "scorch release": "Nature Transformation",
    "blaze release": "Nature Transformation",
    "explosion release": "Nature Transformation",
    "steel release": "Nature Transformation",
    "swift release": "Nature Transformation",
    "mud release": "Nature Transformation",
    "particle release": "Nature Transformation",
    "dust release": "Nature Transformation",
    "yoton": "Nature Transformation",
    "futton": "Nature Transformation",
    "hyōton": "Nature Transformation",
    "ranton": "Nature Transformation",
    "shakuton": "Nature Transformation",
    "enton": "Nature Transformation",
    "bakuton": "Nature Transformation",
    "kōton": "Nature Transformation",
    "jinton": "Nature Transformation",
    "ketsuryūgan": "Dojutsu",
    "jōgan": "Dojutsu",
    "scientific ninja tool": "Body Enhancement",
    "cursed seal": "Body Enhancement",
}

NATURE_TYPES = frozenset({
    "Fire", "Wind", "Lightning", "Water", "Earth",
    "Yin", "Yang", "Yin-Yang",
})

NATURE_RELEASE_TO_TYPE = {
    "fire": "Fire",
    "fire release": "Fire",
    "katon": "Fire",
    "wind": "Wind",
    "wind release": "Wind",
    "fūton": "Wind",
    "futon": "Wind",
    "lightning": "Lightning",
    "lightning release": "Lightning",
    "raiton": "Lightning",
    "water": "Water",
    "water release": "Water",
    "suiton": "Water",
    "earth": "Earth",
    "earth release": "Earth",
    "doton": "Earth",
    "yin": "Yin",
    "yin release": "Yin",
    "yang": "Yang",
    "yang release": "Yang",
    "yin–yang": "Yin-Yang",
    "yin-yang": "Yin-Yang",
    "yin yang": "Yin-Yang",
}

JUTSU_TYPES = frozenset({
    "Ninjutsu", "Genjutsu", "Taijutsu", "Fuinjutsu",
    "Senjutsu", "Kenjutsu",
})

JUTSU_PATTERNS = [
    ("rasengan", "Ninjutsu"),
    ("shadow clone", "Ninjutsu"),
    ("clone", "Ninjutsu"),
    ("fireball", "Ninjutsu"),
    ("chidori", "Ninjutsu"),
    ("water dragon", "Ninjutsu"),
    ("earth release", "Ninjutsu"),
    ("lightning release", "Ninjutsu"),
    ("wind release", "Ninjutsu"),
    ("fire release", "Ninjutsu"),
    ("water release", "Ninjutsu"),
    ("genjutsu", "Genjutsu"),
    ("tsukuyomi", "Genjutsu"),
    ("sharingan", "Genjutsu"),
    ("taijutsu", "Taijutsu"),
    ("eight gates", "Taijutsu"),
    ("gentle fist", "Taijutsu"),
    ("strong fist", "Taijutsu"),
    ("seal", "Fuinjutsu"),
    ("fuinjutsu", "Fuinjutsu"),
    ("cursed seal", "Fuinjutsu"),
    ("sage", "Senjutsu"),
    ("senjutsu", "Senjutsu"),
    ("senpo", "Senjutsu"),
    ("kenjutsu", "Kenjutsu"),
    ("sword", "Kenjutsu"),
    ("blade", "Kenjutsu"),
]

STATUS_VALUES = frozenset({"Alive", "Deceased"})

STATUS_MAP = {
    "deceased": "Deceased",
    "dead": "Deceased",
    "alive": "Alive",
    "incapacitated": "Alive",
    "unknown": None,
}

GENDER_VALUES = frozenset({"Male", "Female", "Unknown"})

GENDER_MAP = {
    "male": "Male",
    "female": "Female",
    "unknown": "Unknown",
}

SPECIES_VALUES = frozenset({
    "Human", "Jinchuriki", "Clone", "Bijuu", "Otsutsuki",
    "Cursed Seal User", "Puppet",
    "Toad", "Snake", "Slug", "Monkey", "Ninken", "Chameleon", "Salamander",
    "Zetsu",
})

SPECIES_MAP = {
    # Human
    "human": "Human",
    "mutated human": "Zetsu",
    "artificial human": "Zetsu",
    # Jinchuriki
    "jinchūriki": "Jinchuriki",
    "jinchuriki": "Jinchuriki",
    # Clone / construct
    "clone": "Clone",
    # Tailed beasts
    "bijuu": "Bijuu",
    "tailed beast": "Bijuu",
    # Otsutsuki
    "ōtsutsuki": "Otsutsuki",
    "otsutsuki": "Otsutsuki",
    # Augmented humans
    "cursed seal user": "Cursed Seal User",
    "puppet": "Puppet",
    # Animal summons
    "toad": "Toad",
    "snake": "Snake",
    "slug": "Slug",
    "monkey": "Monkey",
    "ninken": "Ninken",
    "chameleon": "Chameleon",
    "japanese giant salamander": "Salamander",
}

VILLAGE_ALIASES = {
    "konoha": "Konohagakure",
    "konohagakure": "Konohagakure",
    "sunagakure": "Sunagakure",
    "suna": "Sunagakure",
    "kirigakure": "Kirigakure",
    "kiri": "Kirigakure",
    "kumogakure": "Kumogakure",
    "kumo": "Kumogakure",
    "iwagakure": "Iwagakure",
    "iwa": "Iwagakure",
    "otogakure": "Otogakure",
    "akatsuki": "Akatsuki",
    "allied shinobi forces": "Allied Shinobi Forces",
    "root": "Root",
}
