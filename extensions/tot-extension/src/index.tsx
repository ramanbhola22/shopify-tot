import React, { useEffect, useState } from "react";
import {
  render,
  Divider,
  Image,
  Banner,
  Heading,
  Button,
  InlineLayout,
  BlockStack,
  Text,
  SkeletonText,
  SkeletonImage,
  useCartLines,
  useApplyCartLinesChange,
  useExtensionApi,
} from "@shopify/checkout-ui-extensions-react";

render("Checkout::Dynamic::Render", () => <App />);

function App() {
  const { query, i18n } = useExtensionApi();
  const applyCartLinesChange = useApplyCartLinesChange();
  // Set up the states
  const [products, setProducts] = useState([]);
  const [showError, setShowError] = useState(false);
  const [totAddedToCart, setTotAddedToCart] = useState(false);
  const [totVaraintId, setTotVaraintId] = useState(null);

  const lines = useCartLines();

  useEffect(() => {
    setTotAddedToCart(false);
    query(
      `query ($first: Int!, $query: String!) {
        products(first: $first, query: $query) {
          nodes {
            id
            title
            images(first:1){
              nodes {
                url
              }
            }
            variants(first: 1) {
              nodes {
                id
                price {
                  amount
                }
              }
            }
          }
        }
      }`,
      {
        variables: { first: 5, query: 'tot' },
      },
    )
      .then(({ data }) => {
        setProducts(data.products.nodes)
      })
      .catch((error) => setShowError(true));
  }, []);

  useEffect(() => {
    if (showError) {
      const timer = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showError]);

  useEffect(() => {
    if (products.length > 0) {
      setTotVaraintId(products[0].variants.nodes[0].id)
    }
  }, [products]);

  useEffect(async () => {
    if (totVaraintId !== null) {

      let currentQuantity = 0;
      let quantityToAdd = lines.length;
      let totalProducts = lines.length;

      let totFound = false;

      if (totalProducts > 0) {
        for (let lineItem of lines) {
          if (lineItem.merchandise.id === totVaraintId) {
            totFound = true;
            currentQuantity = lineItem.quantity;
          }
        }
      }

      if (totFound) {
        quantityToAdd = quantityToAdd - 1;//remove tot self 
      }

      let updateTot = true;
      if (quantityToAdd === currentQuantity) {
        updateTot = false;
      }

      if (quantityToAdd > currentQuantity) {

        quantityToAdd = quantityToAdd - currentQuantity;
        // console.log("add more quantity", quantityToAdd);

        if (quantityToAdd > 0) {
          const result = await applyCartLinesChange({
            type: "addCartLine",
            merchandiseId: totVaraintId,
            quantity: quantityToAdd
          });
          if (result.type === "error") {
            setShowError(true);
            setTotAddedToCart(false);
          } else {
            setTotAddedToCart(true);
          }
        } else {
          setTotAddedToCart(true);
        }

      } else if (quantityToAdd < currentQuantity) {

        let quantityToRemove = currentQuantity - quantityToAdd;
        // console.log("remove quantity", quantityToRemove);

        if (quantityToRemove > 0) {
          const result = await applyCartLinesChange({
            type: "addCartLine",
            merchandiseId: totVaraintId,
            quantity: -(quantityToRemove)
          });
          if (result.type === "error") {
            setShowError(true);
            setTotAddedToCart(false);
          } else {
            setTotAddedToCart(true);
          }
        } else {
          setTotAddedToCart(true);
        }

      } else {
        setTotAddedToCart(true);
      }

    }
  }, [totVaraintId]);

  if (showError) {
    return (
      <BlockStack spacing="loose">
        <Banner status="critical">
          There was an issue adding this product. Please try again.
        </Banner>
      </BlockStack>
    );
  }

  if (!totAddedToCart) {
    return (
      <BlockStack spacing="loose">
        <Divider />
        <SkeletonText inlineSize="small" />
      </BlockStack>
    );
  }


  if (totAddedToCart) {
    return (
      <BlockStack spacing="loose">
        <Banner status="success">
          ToT Item added to Checkout
        </Banner>
      </BlockStack>
    );
  }


  return (
    <BlockStack spacing="loose">
      <Divider />
      <Heading level={2}>You might also like</Heading>
      <BlockStack spacing="loose">
        <InlineLayout
          spacing="base"
          // Use the `columns` property to set the width of the columns
          // Image: column should be 64px wide
          // BlockStack: column, which contains the title and price, should "fill" all available space
          // Button: column should "auto" size based on the intrinsic width of the elements
          columns={[64, "fill", "auto"]}
          blockAlignment="center"
        >
          <Image
            border="base"
            borderWidth="base"
            borderRadius="loose"
            source={imageUrl}
            description={title}
            aspectRatio={1}
          />
          <BlockStack spacing="none">
            <Text size="medium" emphasis="strong">
              {title}
            </Text>
            <Text appearance="subdued">{renderPrice}</Text>
          </BlockStack>
          <Button
            kind="secondary"
            loading={adding}
            accessibilityLabel={`Add ${title} to cart`}
            onPress={async () => {
              setAdding(true);
              // Apply the cart lines change
              const result = await applyCartLinesChange({
                type: "addCartLine",
                merchandiseId: variants.nodes[0].id,
                quantity: 1,
              });
              setAdding(false);
              if (result.type === "error") {
                // An error occurred adding the cart line
                // Verify that you're using a valid product variant ID
                // For example, 'gid://shopify/ProductVariant/123'
                setShowError(true);
                console.error(result.message);
              }
            }}
          >
            Add
          </Button>
        </InlineLayout>
      </BlockStack>
      {showError && (
        <Banner status="critical">
          There was an issue adding this product. Please try again.
        </Banner>
      )}
    </BlockStack>
  );
}
