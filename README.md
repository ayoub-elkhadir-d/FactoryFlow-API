# FactoryFlow API

API de gestion des ordres de fabrication et des matières premières.

## Gestion des matières premières

Toutes les routes de matières premières exigent un jeton Bearer obtenu via
`POST /api/auth/login`.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/raw-materials` | Liste les matières actives; accepte `?search=` pour filtrer par SKU, nom ou fournisseur |
| `POST` | `/api/raw-materials` | Crée une matière première |
| `GET` | `/api/raw-materials/:id` | Consulte une matière première |
| `PATCH` | `/api/raw-materials/:id` | Modifie ses informations |
| `DELETE` | `/api/raw-materials/:id` | Désactive la matière (suppression logique) |
| `GET` | `/api/raw-materials/:id/movements` | Consulte l'historique des mouvements |
| `POST` | `/api/raw-materials/:id/movements` | Enregistre une entrée ou une sortie de stock |

Une matière nécessite `sku`, `name` et `unit`. `minimumStock`, `unitCost`,
`description` et `supplier` sont facultatifs. Le stock ne se modifie pas
directement lors de la création ou mise à jour; il est géré par les mouvements.
Exemple de mouvement:

```json
{
  "movementType": "ENTRY",
  "quantity": 25,
  "unitCost": 4.5,
  "reason": "Réapprovisionnement"
}
```

Utilisez `EXIT` pour une sortie. La mise à jour du stock et son historique sont
enregistrés dans une transaction MongoDB; une sortie supérieure au stock
disponible est refusée.

## Produits et composition

Les routes produits exigent aussi un jeton d'authentification.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/products` | Liste les produits actifs |
| `POST` | `/api/products` | Crée un produit |
| `GET` | `/api/products/:id` | Consulte un produit et sa composition |
| `PATCH` | `/api/products/:id` | Modifie les informations du produit |
| `PUT` | `/api/products/:id/composition` | Remplace sa composition |

La composition indique les quantités de matières premières nécessaires pour
fabriquer une unité du produit. Exemple:

```json
{
  "composition": [
    { "rawMaterial": "65f1234567890abcdef12345", "quantity": 2 }
  ]
}
```

Chaque matière doit être active, et une même matière ne peut apparaître qu'une
fois. Envoyez une liste vide pour effacer la composition.

## Mouvements de stock

Les routes `/api/stock-movements` exigent un jeton d'authentification. Elles
permettent de consulter et d'enregistrer les mouvements des produits comme des
matières premières.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/stock-movements` | Liste tous les mouvements |
| `GET` | `/api/stock-movements/:id` | Consulte un mouvement |
| `POST` | `/api/stock-movements` | Enregistre une entrée ou une sortie |

Pour créer un mouvement, envoyez `itemModel` (`Product` ou `RawMaterial`),
`item` (l'identifiant de l'article), `movementType` (`ENTRY` ou `EXIT`) et une
quantité positive. Les sorties supérieures au stock disponible sont refusées.
