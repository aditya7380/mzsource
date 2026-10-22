"""
MZ Source educational catalogue seeder.

Adds 35 illustrative project kits and 30 individual electronic components.
Existing products are preserved. Products are matched by model number to
avoid duplicate inserts on repeated runs.

Run from backend/mz_backend:
    ./venv/bin/python add_project_kits.py
"""

from uuid import uuid4

from app.models import Product

# This project already has category/subcategory IDs in figma_seed_data.json.
KITS_CATEGORY_ID = "cat-3"
KITS_SUBCATEGORY_ID = "sub-3-3"  # DIY Kits
ELECTRONICS_CATEGORY_ID = "cat-1"
BASIC_ELECTRONICS_SUBCATEGORY_ID = "sub-1-1"
SENSORS_SUBCATEGORY_ID = "sub-1-2"

# Keep the existing project's database session setup.
try:
    from app.database import SessionLocal
except ImportError:
    try:
        from app.database import SessionLocal
    except ImportError as exc:
        raise ImportError(
            "Could not import SessionLocal. Check the database/session import "
            "used by the existing seed.py file."
        ) from exc


LEVELS = [
    {
        "code": "L01",
        "level": "Classes 1–2",
        "name": "Little Explorers",
        "projects": [
            ("Colour & Light Discovery Kit", "Explore light, colour filters and safe low-voltage LED demonstrations."),
            ("Battery and Bulb Discovery Kit", "Learn how a simple battery, lamp and closed circuit work."),
            ("Magnetism and Switches Kit", "Explore magnets, magnetic objects and simple switch concepts."),
            ("Safe Circuit Connection Kit", "Connect pre-prepared low-voltage circuit modules with adult supervision."),
            ("Everyday Electricity Discovery Kit", "Illustrate conductors, insulators and common electrical safety ideas."),
        ],
    },
    {
        "code": "L23",
        "level": "Classes 3–5",
        "name": "Young Science Makers",
        "projects": [
            ("Buzzer and Alert Circuit Kit", "Build a simple low-voltage buzzer alert."),
            ("Conductivity Tester Kit", "Compare conductive and insulating everyday materials."),
            ("Mini Electromagnet Demonstration Kit", "Explore electromagnetism using a supervised low-voltage setup."),
            ("Mini Fan and Motor Kit", "Learn how a small DC motor converts electrical energy into motion."),
            ("Simple Door Alarm Project Kit", "Build a basic contact-switch alarm demonstration."),
        ],
    },
    {
        "code": "L68",
        "level": "Classes 6–8",
        "name": "Junior Electronics Lab",
        "projects": [
            ("Breadboard Basics Kit", "Learn breadboard rows, connections and basic circuit building."),
            ("LED and Resistor Experiments Kit", "Build LED circuits and investigate current-limiting resistors."),
            ("Continuity Tester Project Kit", "Create a simple low-voltage continuity tester."),
            ("DC Motor Experiments Kit", "Explore motor direction, speed and simple mechanical loads."),
            ("Light-Sensitive Circuit Kit", "Build a light-dependent resistor based switching demonstration."),
        ],
    },
    {
        "code": "L910",
        "level": "Classes 9–10",
        "name": "School Innovators Lab",
        "projects": [
            ("Arduino Starter Project Kit", "Introduction to microcontrollers, digital pins and simple programs."),
            ("Automatic Night Lamp Kit", "Use a light sensor to control a low-voltage LED lamp."),
            ("Water-Level Alarm Kit", "Demonstrate water-level sensing with an appropriate sensor module."),
            ("Obstacle Detection Kit", "Use an ultrasonic or infrared sensor to detect nearby objects."),
            ("Mini Robotics Foundations Kit", "Build a basic motor-driven robot platform."),
        ],
    },
    {
        "code": "L1112",
        "level": "Classes 11–12",
        "name": "Senior STEM Engineering Lab",
        "projects": [
            ("Sensor Interfacing Project Kit", "Read and interpret sensor values using a microcontroller."),
            ("Digital Logic Experiments Kit", "Explore logic gates, truth tables and simple digital circuits."),
            ("Smart Irrigation Demonstration Kit", "Combine soil-moisture sensing with controlled low-voltage pumping."),
            ("Environmental Data Logger Kit", "Measure and record selected environmental sensor values."),
            ("Bluetooth-Controlled Model Kit", "Demonstrate wireless control of a low-voltage model."),
        ],
    },
    {
        "code": "DIPBTECH",
        "level": "Diploma / B.Tech / B.Sc. Engineering",
        "name": "Engineering Project Lab",
        "projects": [
            ("Embedded Systems Development Kit", "Prototype microcontroller-based embedded applications."),
            ("IoT Monitoring Project Kit", "Collect sensor readings and demonstrate networked monitoring."),
            ("Line-Following Robot Kit", "Build a robot that follows a marked path using suitable sensors."),
            ("Wireless Communication Learning Kit", "Explore short-range wireless communication modules."),
            ("Power Electronics Demonstration Kit", "Study controlled low-voltage power conversion and switching."),
        ],
    },
    {
        "code": "RESEARCH",
        "level": "M.Tech / M.Sc. / PhD / Research",
        "name": "Advanced Research Prototyping Lab",
        "projects": [
            ("FPGA Prototyping Project Kit", "Prototype digital logic and selected hardware-accelerated designs."),
            ("Advanced Sensor Acquisition Kit", "Build a sensor measurement and data acquisition prototype."),
            ("Edge IoT Research Kit", "Prototype local processing and networked sensor applications."),
            ("Signal Processing Lab Kit", "Acquire suitable signals for sampling and digital processing experiments."),
            ("Robotics Research Platform Kit", "Develop and extend a modular robotics prototype."),
        ],
    },
]

COMPONENTS = [
    ("LED Assortment Pack", "LEDs in assorted colours for low-voltage indicators.", "sub-1-1"),
    ("Resistor Assortment Pack", "Common resistor values for educational circuit prototyping.", "sub-1-1"),
    ("Ceramic Capacitor Pack", "Assorted ceramic capacitors for basic circuit experiments.", "sub-1-1"),
    ("Electrolytic Capacitor Pack", "Polarised capacitors for suitable low-voltage circuits.", "sub-1-1"),
    ("Small Signal Diode Pack", "General-purpose diodes for learning rectification and protection.", "sub-1-1"),
    ("Rectifier Diode Pack", "Rectifier diodes for supervised low-voltage experiments.", "sub-1-1"),
    ("NPN Transistor Pack", "NPN transistors for switching and introductory amplification.", "sub-1-1"),
    ("MOSFET Switching Module", "MOSFET-based low-voltage switching module.", "sub-1-1"),
    ("Push Button Switch Pack", "Momentary push buttons for prototype circuits.", "sub-1-1"),
    ("Toggle Switch Pack", "Small switches for educational control circuits.", "sub-1-1"),
    ("Active Buzzer Module", "Low-voltage buzzer module for alerts and indicators.", "sub-1-1"),
    ("Mini DC Motor", "Small DC motor for basic motion projects.", "sub-1-4"),
    ("Plastic Propeller Pack", "Propellers for compatible small motor demonstrations.", "sub-1-4"),
    ("Servo Motor", "Position-controlled servo for robotics prototypes.", "sub-1-4"),
    ("Stepper Motor", "Stepper motor for motion-control experiments.", "sub-1-4"),
    ("Motor Driver Module", "Driver module for compatible low-voltage DC motors.", "sub-1-4"),
    ("Ultrasonic Distance Sensor", "Distance measurement module for robotics and automation.", "sub-1-2"),
    ("Light Sensor Module", "Light sensing module for automatic-light projects.", "sub-1-2"),
    ("Temperature Sensor Module", "Temperature measurement module for microcontroller projects.", "sub-1-2"),
    ("Soil Moisture Sensor", "Soil-moisture sensing module for irrigation demonstrations.", "sub-1-2"),
    ("PIR Motion Sensor", "Motion sensing module for low-voltage alert projects.", "sub-1-2"),
    ("IR Sensor Module", "Infrared sensing module for obstacle and line-following projects.", "sub-1-2"),
    ("Arduino-Compatible Development Board", "Microcontroller development board; exact model to be confirmed.", "sub-1-1"),
    ("ESP32-Compatible Development Board", "Wireless-capable development board; exact model to be confirmed.", "sub-1-1"),
    ("Breadboard", "Solderless prototyping board for temporary circuits.", "sub-1-1"),
    ("Jumper Wire Set", "Male-male, male-female and/or female-female wires; pack contents to be confirmed.", "sub-1-1"),
    ("USB Data Cable", "Data and power cable compatible with the selected development board.", "sub-1-1"),
    ("LCD Display Module", "Character display module for microcontroller projects.", "sub-1-1"),
    ("Relay Module", "Relay module for appropriately isolated low-voltage control demonstrations.", "sub-1-1"),
    ("Microphone / Audio Sensor Module", "Audio sensing module for sound-responsive experiments.", "sub-1-2"),
]

COLOURS = [
    "#E1F3E8", "#E4EEFF", "#FBEBDD", "#FFF2CC", "#F3E8FF",
    "#DDF5F4", "#FCE7F3", "#E8EDF5", "#F1F5D8", "#E9E2FF",
]


def build_records():
    records = []

    for level in LEVELS:
        for index, (kit_name, description) in enumerate(level["projects"], start=1):
            model = f"DEMO-{level['code']}-KIT-{index:02d}"
            specs = (
                f"Suitable level: {level['level']} | "
                f"Catalogue group: {level['name']} | "
                f"Example use: {description} | "
                "Guide: Project guide to be prepared | "
                "Listing type: Illustrative demo concept; contents and availability unconfirmed"
            )
            records.append({
                "name": kit_name,
                "category_id": KITS_CATEGORY_ID,
                "subcategory_id": KITS_SUBCATEGORY_ID,
                "model_number": model,
                "description": (
                    f"{description} Suitable for {level['level']}. "
                    "Illustrative catalogue listing only; final components, safety "
                    "requirements, guide and availability must be confirmed before sale."
                ),
                "specifications": specs,
                "unit_type": "Set",
                "availability": "On_Request",
                "image_color": COLOURS[index % len(COLOURS)],
                "image_url": None,
                "active": True,
            })

    for index, (name, description, subcategory) in enumerate(COMPONENTS, start=1):
        records.append({
            "name": name,
            "category_id": ELECTRONICS_CATEGORY_ID,
            "subcategory_id": subcategory,
            "model_number": f"DEMO-COMP-{index:03d}",
            "description": (
                f"{description} Illustrative catalogue entry; exact specifications, "
                "compatibility, pack quantity, price and availability require confirmation."
            ),
            "specifications": (
                "Listing type: Demo catalogue entry | "
                "Image: Placeholder; add verified product photo later | "
                "Price: On request | Availability: Must be confirmed"
            ),
            "unit_type": "Piece",
            "availability": "On_Request",
            "image_color": COLOURS[(index + 3) % len(COLOURS)],
            "image_url": None,
            "active": True,
        })

    return records


def main():
    db = SessionLocal()
    added = 0
    skipped = 0

    try:
        for data in build_records():
            existing = (
                db.query(Product)
                .filter(Product.model_number == data["model_number"])
                .first()
            )

            if existing:
                skipped += 1
                continue

            db.add(Product(id=str(uuid4()), **data))
            added += 1

        db.commit()
        print(f"Catalogue seeding complete. Added: {added}; already present: {skipped}.")
        print("Illustrative listings only; confirm stock, prices and contents before selling.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()