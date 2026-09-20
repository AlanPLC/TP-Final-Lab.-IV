import {
  Apple,
  Milk,
  Beef,
  Fish,
  Croissant,
  Cookie,
  Candy,
  Popcorn,
  CupSoda,
  Coffee,
  Beer,
  Wine,
  Snowflake,
  IceCreamCone,
  Sparkles,
  Pill,
  Baby,
  PawPrint,
  Package,
} from 'lucide-react'

// Catálogo cerrado de logos para productos: en vez de subir una imagen libre
// (que en producción terminaría llenando el proyecto de archivos), se elige
// uno de estos íconos. Si se agrega/saca un ítem acá, replicar el mismo
// cambio en API/src/constants/productIcons.js (lista de keys válidas para la
// validación del backend) - las dos listas tienen que quedar sincronizadas.
export const PRODUCT_ICONS = [
  { key: 'frutas_verduras', label: 'Frutas y Verduras', Icon: Apple },
  { key: 'lacteos', label: 'Lácteos', Icon: Milk },
  { key: 'carnes', label: 'Carnes', Icon: Beef },
  { key: 'pescados', label: 'Pescados y Mariscos', Icon: Fish },
  { key: 'panaderia', label: 'Panadería', Icon: Croissant },
  { key: 'galletitas', label: 'Galletitas', Icon: Cookie },
  { key: 'golosinas', label: 'Golosinas', Icon: Candy },
  { key: 'snacks', label: 'Snacks', Icon: Popcorn },
  { key: 'bebidas', label: 'Bebidas y Gaseosas', Icon: CupSoda },
  { key: 'cafe', label: 'Café e Infusiones', Icon: Coffee },
  { key: 'cervezas', label: 'Cervezas', Icon: Beer },
  { key: 'vinos', label: 'Vinos y Licores', Icon: Wine },
  { key: 'congelados', label: 'Congelados', Icon: Snowflake },
  { key: 'helados', label: 'Helados', Icon: IceCreamCone },
  { key: 'limpieza', label: 'Limpieza', Icon: Sparkles },
  { key: 'farmacia', label: 'Farmacia e Higiene', Icon: Pill },
  { key: 'bebes', label: 'Bebés', Icon: Baby },
  { key: 'mascotas', label: 'Mascotas', Icon: PawPrint },
  { key: 'otros', label: 'Otros', Icon: Package },
]

export const PRODUCT_ICON_KEYS = PRODUCT_ICONS.map((i) => i.key)

const ICON_BY_KEY = new Map(PRODUCT_ICONS.map((i) => [i.key, i.Icon]))

// Ícono a mostrar para un producto ya guardado - si la key no matchea
// ninguna del catálogo (dato viejo, o corrupto), cae en el ícono genérico.
export function getProductIcon(key) {
  return ICON_BY_KEY.get(key) ?? Package
}

// Logo y categoría van de la mano: elegir uno de estos íconos (todos menos
// "Otros") define el logo Y la categoría del producto en un solo paso - el
// nombre de cada categoría "de logo" coincide exactamente con estos labels
// (se siembran así en API/db/schema.sql). "Otros" queda afuera a propósito:
// ahí el usuario elige (o crea) una categoría propia en un select aparte.
export const LOGO_CATEGORY_KEY = 'otros'
export const LOGO_CATEGORY_ICONS = PRODUCT_ICONS.filter((i) => i.key !== LOGO_CATEGORY_KEY)
export const LOGO_CATEGORY_LABELS = new Set(LOGO_CATEGORY_ICONS.map((i) => i.label))
