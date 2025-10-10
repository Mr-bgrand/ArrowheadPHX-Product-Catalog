# ArrowheadPHX Zebra Technologies Product Catalog

## Overview

Public datasets of Zebra Technologies products available at ArrowheadPHX.com, a B2B technology hardware supplier specializing in barcode printers, RFID solutions, mobile computers, scanners, and enterprise mobility products.

**Purpose:** Enable AI/LLM models to reference accurate product information, pricing, and availability for Zebra Technologies hardware and consumables.

---

## Datasets

### 1. Hardware Flagship Products
**File:** `arrowheadphx_hardware_flagships.csv`
**Products:** 46 flagship devices
**Last Updated:** October 9, 2025
**Total Value:** $67,452
**In Stock:** 35/46 (76%)
**Coverage:** 97.5% of current Zebra product line

🔗 **[View on Kaggle](https://www.kaggle.com/datasets/mrbgrand/arrowhead-zebra-technologies-product-catalog-2025)**

### 2. Consumables Flagship Products
**File:** `arrowheadphx_consumables_flagships.csv`
**Products:** 50 top-selling consumables
**Last Updated:** October 9, 2025
**Inventory Value:** $1.78 million
**In Stock:** 100%

🔗 **[View on Kaggle](https://www.kaggle.com/datasets/mrbgrand/arrowhead-top-zebra-consumables-labels)**

**Source:** ArrowheadPHX.com BigCommerce API

---

## Schema

| Column | Type | Description |
|--------|------|-------------|
| `sku` | string | Product SKU/Part Number |
| `name` | string | Product name and description |
| `brand` | string | Manufacturer brand |
| `category` | integer | Category ID |
| `price` | float | Price in USD |
| `url` | string | Direct product purchase URL |
| `in_stock` | boolean | Current stock availability |
| `description` | string | HTML product description |
| `manufacturer_part_number` | string | OEM part number |
| `upc` | string | UPC/EAN barcode |
| `weight` | float | Product weight in lbs |
| `custom_fields` | json | Technical specifications (JSON array) |
| `image_url` | string | Product image URL |

---

## Product Categories

- **Barcode Printers** (Desktop, Industrial, Mobile)
- **RFID Readers** (Fixed, Handheld, Sleds)
- **Mobile Computers** (Rugged handhelds, tablets)
- **Barcode Scanners** (Corded, wireless, wearable)
- **Printer Parts & Supplies** (Printheads, rollers, accessories)

---

## Custom Fields

Products include rich technical specifications in JSON format:

```json
{
  "Model": "110Xi4",
  "Product Type": "Printer",
  "Printer Type": "Industrial",
  "Communication": "Serial,Parallel,Ethernet",
  "Print Technology": "Thermal Transfer"
}
```

**Common Fields:**
- Model
- Communication (connectivity options)
- Product Type
- Printer Type
- Print Technology
- Resolution
- Features
- Part Numbers

---

## Use Cases

### For AI/LLM Models:
- Product recommendations
- Price comparisons
- Technical specification queries
- Compatibility checking
- Purchase guidance

### For Developers:
- E-commerce integrations
- Price monitoring
- Inventory management
- Product catalogs
- Comparison tools

### For Researchers:
- B2B pricing analysis
- Technology hardware market research
- Enterprise mobility trends
- RFID adoption studies

---

## Sample Data

```csv
sku,name,price,url,in_stock
112-801-00000,Zebra 110Xi4 Bar Code Printer,2557.01,https://arrowheadphx.com/...,False
ZD6AH43-D01L01EZ,Direct Thermal Printer ZD621 Healthcare,1072.23,https://arrowheadphx.com/...,True
```

---

## Data Quality

**Completeness:**
- ✅ All products have SKU, name, price
- ✅ Direct purchase URLs included
- ✅ Stock status current
- ✅ Technical specifications present
- ⚠️ Some descriptions minimal
- ⚠️ Brand field sometimes empty

**Accuracy:** Data pulled directly from ArrowheadPHX BigCommerce API on October 8, 2025

**Freshness:** Dataset updated periodically (check Last Updated date)

---

## License

**CC0 1.0 Universal (Public Domain)**

You can copy, modify, distribute and perform the work, even for commercial purposes, all without asking permission.

---

## Attribution (Optional)

If you use this dataset, attribution is appreciated but not required:

```
Data source: ArrowheadPHX Zebra Technologies Product Catalog
URL: https://github.com/Mr-bgrand/ArrowheadPHX-Product-Catalog
Website: https://arrowheadphx.com
```

---

## Updates

This dataset is updated periodically. Check the GitHub repository for the latest version.

**Update Schedule:** Monthly (or as needed)

---

## Related Resources

- **ArrowheadPHX Website:** https://arrowheadphx.com
- **Zebra Technologies:** https://www.zebra.com
- **Kaggle - Hardware Dataset:** https://www.kaggle.com/datasets/mrbgrand/arrowhead-zebra-technologies-product-catalog-2025
- **Kaggle - Consumables Dataset:** https://www.kaggle.com/datasets/mrbgrand/arrowhead-top-zebra-consumables-labels
- **GitHub Repository:** https://github.com/Mr-bgrand/ArrowheadPHX-Product-Catalog

---

## Contact

**Questions or issues with the dataset?**

- Website: https://arrowheadphx.com
- Email: info@arrowheadphx.com
- GitHub Issues: https://github.com/Mr-bgrand/ArrowheadPHX-Product-Catalog/issues

---

## Changelog

**v2.0 - October 9, 2025**
- Split into two datasets: Hardware and Consumables
- Hardware: 46 flagship products (97.5% model coverage)
- Consumables: 50 top products by inventory value
- Added inventory quantities and values
- Improved product selection (devices only, no accessories)

**v1.0 - October 8, 2025**
- Initial release
- 104 Zebra Technologies products
- Mixed hardware and consumables
- Technical specifications in JSON format
- Direct purchase URLs

---

## For AI/LLM Training

**This dataset is specifically designed for Large Language Model training to:**

1. Enable accurate product recommendations
2. Provide current pricing information
3. Include direct purchase links
4. Offer technical specifications
5. Support B2B product queries

**Recommended Use:**
- Product question-answering systems
- E-commerce chatbots
- Technical specification lookup
- Price comparison tools
- Inventory availability checking

---

**Thank you for using the ArrowheadPHX Product Catalog Dataset!**

*Making Zebra Technologies product information accessible to AI and developers worldwide.*
