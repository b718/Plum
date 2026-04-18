### Products Table Design

The goal of this project is to make commerce easier. Imagine a world where you could describe what you wanted in natural language; this would be incredible. Although we are using Qdrant which is a vector database, I will write the table in a SQL fashion to make it easier for all to understand.

```
Products Table

// This is the id of the product
id -> UUID

// This is the name of the product
name -> VARCHAR(255)

// This is a description of the product.
description -> TEXT

// This is the category(s) that the product belongs to.
category: string;

// This is the URL to purchase the product
url: string;
```
