# Hotel Photo Upload Guide

## How to Add Hotel Photos

1. Place photos in the correct folder (see structure below)
2. Name them `1.jpg`, `2.jpg`, `3.jpg` etc.
3. Push to git → photos auto-deploy to the website

---

## Folder Structure

```
hotel-images/
├── tamil-nadu/
│   ├── yercaud/
│   │   ├── grand-signature/        → 1.jpg, 2.jpg, 3.jpg ...
│   │   ├── tgi/
│   │   ├── kolagalam/
│   │   ├── sterling/
│   │   ├── selvamathi-saffron/
│   │   ├── the-mainland-resort/
│   │   ├── clif-view-resort/
│   │   └── forest-medows/
│   ├── kodaikanal/
│   │   └── the-peak-resort/
│   ├── coimbatore/
│   │   ├── lemon-tree/
│   │   ├── itc-coimbatore/
│   │   └── fairfield-marriot/
│   └── anakatti/
│       ├── my-village/
│       ├── tusker/
│       └── sterling/
│
├── karnataka/
│   ├── bangalore/
│   │   ├── ramee-guest-line/
│   │   ├── rk-gardenia/
│   │   ├── ts-royal-grand/
│   │   ├── south-end-by-tgi/
│   │   ├── fortune-jp/
│   │   ├── gold-finch/
│   │   ├── vividus/
│   │   ├── altrus/
│   │   ├── gokulam-grand/
│   │   ├── garden-asia/
│   │   ├── elim-resort/
│   │   ├── ibis/
│   │   ├── svenska/
│   │   ├── the-lalit-ashok/
│   │   ├── hollydag-inn/
│   │   ├── howard-jhonsen/
│   │   ├── country-in-by-radisson/
│   │   ├── the-chanchery-pavilion/
│   │   ├── firefield-by-marriot/
│   │   ├── the-wawerly-hotel/
│   │   ├── mgm-mark-white-field/
│   │   ├── lemon-tree-ulsoor/
│   │   ├── lemon-tree-whitefiled/
│   │   ├── hotel-davanam-sarover/
│   │   ├── ramada-encore/
│   │   └── lavender/
│   ├── mysore/
│   │   ├── country-mysore/
│   │   ├── jp-palace/
│   │   ├── ibis/
│   │   ├── arcor-hotel/
│   │   ├── pai-vista/
│   │   ├── grand-merqre/
│   │   ├── le-ruchi/
│   │   ├── hotel-mayura-hoysala/
│   │   ├── hotel-ruchi-prince/
│   │   ├── emarald-clarks/
│   │   ├── rio-meridian/
│   │   ├── hotel-le-grandeur/
│   │   ├── royal-orchid-metropole/
│   │   ├── hotel-sandesh-prince/
│   │   ├── the-atrium-botique/
│   │   ├── the-qourom-hotel/
│   │   ├── m-pro-palace/
│   │   ├── mariah-botique-hotel/
│   │   └── grand-serena/
│   └── coorg/
│       ├── hotel-coorg-palace-inn/
│       ├── hotel-coorg-heights/
│       ├── oxyrich-business-class-hotel/
│       ├── altitude-coorg/
│       ├── treebo-regulia-comfort/
│       └── coorg-heritage/
│
├── kerala/
│   ├── kochi/
│   │   ├── marriot-kochin/
│   │   ├── novotel/
│   │   ├── fortune/
│   │   ├── four-point-sheraton/
│   │   ├── holiday-inn/
│   │   ├── key-select-by-lemon-tree/
│   │   ├── ibis-kochin/
│   │   ├── casino/
│   │   ├── coral-reef/
│   │   ├── ramada-by-wyndham/
│   │   ├── raas-residency/
│   │   ├── maritime-kochi/
│   │   ├── trident-hotel-cochin/
│   │   ├── the-avenue-regent/
│   │   ├── sugar-business-hotel/
│   │   ├── le-meridien-kochi/
│   │   ├── grand-hotel/
│   │   ├── hotel-palmyra-grand/
│   │   ├── ginger-mg-road/
│   │   ├── hotel-kochi-legacy/
│   │   ├── millennium-continental/
│   │   ├── nm-royalecounty/
│   │   ├── luminara/
│   │   ├── sidra-pristine-hotel/
│   │   ├── retrieve-health-and-wellness/
│   │   ├── d-mirage/
│   │   ├── pgs-vedanta/
│   │   ├── le-maritime/
│   │   ├── olive-downtown/
│   │   ├── avanue-regant/
│   │   ├── radission-blu/
│   │   ├── tiros-hotels/
│   │   ├── hotel-fort-queen/
│   │   ├── abaam-hotel/
│   │   ├── gokulam-grand/
│   │   ├── flora-charishma/
│   │   ├── travan-core-court/
│   │   ├── aura-one-hotel/
│   │   ├── yuvarani-recidency/
│   │   ├── abad-cochi-chullikal/
│   │   ├── the-mercy-luxury-business/
│   │   ├── span-international/
│   │   ├── kent-baywatch-suites/
│   │   ├── the-cabana/
│   │   ├── mezkar-recidency/
│   │   ├── sealagoon-health-resort/
│   │   └── board-bean-cochi/
│   ├── thrissur/
│   │   ├── hotel-niya-regency/
│   │   ├── dass-continental/
│   │   ├── joys-palace/
│   │   ├── hotel-ashoka-in/
│   │   ├── park-in-by-radisson/
│   │   ├── the-garuda/
│   │   ├── hotel-merlin-international/
│   │   ├── hayatt-regency/
│   │   ├── casino-hotel-ltd/
│   │   ├── lumbini-supreme-business/
│   │   ├── trichur-towers/
│   │   ├── zip-by-spree-mangla-tower/
│   │   ├── hotel-savera-park/
│   │   └── smart-residency/
│   ├── thekkady/
│   │   ├── woodnote/
│   │   ├── sterling/
│   │   ├── jungle-park-resort/
│   │   ├── hotel-tigers-roare/
│   │   ├── hotel-lincoln-squre/
│   │   ├── tiger-trails/
│   │   ├── hotel-lakeshore-inn/
│   │   ├── grand-glory-tourist/
│   │   ├── gokul-residency/
│   │   └── livins-thekkedy/
│   ├── munnar/
│   │   ├── caramel-top-resort/
│   │   ├── arul-mount/
│   │   ├── issacs-residency/
│   │   ├── green-ridge/
│   │   ├── silver-tips-resort/
│   │   ├── hotel-white-house/
│   │   ├── lumino-dwelling/
│   │   ├── grand-plaza/
│   │   ├── red-sparrow-hotels/
│   │   ├── hotel-hillview/
│   │   ├── casa-montana/
│   │   ├── clouds-valley-leisure/
│   │   ├── maxmunnar/
│   │   └── elisyum-gardens/
│   └── palakkad/
│       ├── sterling/
│       ├── tripenta/
│       └── districk-nine/
│
└── pondicherry/
    └── pondicherry/
        ├── le-royal-park/
        ├── annamali-international/
        ├── sivakavi-hotel/
        ├── accord-pondi/
        ├── ratan-hotel-pondi/
        ├── anandha-inn/
        ├── shenbaga/
        ├── hotel-atithi/
        ├── sands-point/
        ├── residency-tower/
        ├── ginger/
        ├── mango-hills-auroville/
        ├── james-court/
        ├── nalla-beach/
        ├── ashok-beach-resort/
        ├── seaborne-beach/
        ├── ocean-spray/
        ├── k-resort/
        ├── mango-hill-hotel-shadow/
        ├── king-avarta-resort/
        ├── hidden-bay/
        ├── sunway-manor/
        ├── radisson/
        ├── lagoon-sarovar-de-pondy/
        ├── le-pondy/
        ├── rkn-beach-resort/
        ├── the-shore-thirshvam/
        ├── mango-hill-la-serene/
        └── shallow-beach-resorts/
```

---

## Rules

- **File names**: `1.jpg`, `2.jpg`, `3.jpg` (keep it simple)
- **Format**: JPG preferred, max 2MB per photo
- **Min photos**: 1, recommended 3–5 per hotel
- **Folder name**: lowercase, spaces replaced with `-` (already listed above)

## Example

To add photos for **Grand Signature** hotel in **Yercaud**:
```
hotel-images/tamil-nadu/yercaud/grand-signature/1.jpg
hotel-images/tamil-nadu/yercaud/grand-signature/2.jpg
hotel-images/tamil-nadu/yercaud/grand-signature/3.jpg
```

Then run:
```
git add hotel-images/
git commit -m "Add photos for Grand Signature, Yercaud"
git push origin main
```

Website updates automatically in ~2 minutes.
