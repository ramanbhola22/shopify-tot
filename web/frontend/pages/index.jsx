import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  Stack,
  Link,
  Text,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { useTranslation, Trans } from "react-i18next";
import { Cart, Features } from "@shopify/app-bridge/actions";
import { useAppQuery } from "../hooks";

import { trophyImage } from "../assets";


export default function HomePage() {

  const { t } = useTranslation();
  const app = useAppBridge();

  console.log("appbridge", app);

  console.log("add to cart");

  app.featuresAvailable().then(function (state) {
    console.log(state);
  });

  var cart = Cart.create(app);
  var unsubscriber = cart.subscribe(Features.Action.UPDATE, function (payload) {
    console.log('[Client] addLineItem', payload);
    // unsubscriber();
  });

  const {
    
  } = useAppQuery({
    url: "/api/products/count",
    reactQueryOptions: {
      onSuccess: () => {
        setIsLoading(false);
      },
    },
  });

  return (
    <Page narrowWidth>
      <TitleBar title={t("HomePage.title")} primaryAction={null} />
      <Layout>
        <Layout.Section>
          <Card sectioned>
            <Stack
              wrap={false}
              spacing="extraTight"
              distribution="trailing"
              alignment="center"
            >
              <Stack.Item fill>
                <TextContainer spacing="loose">
                  <Text as="h2" variant="headingMd">
                    {t("HomePage.heading")}
                  </Text>
                  <p>{t("HomePage.subHeading")}</p>
                </TextContainer>
              </Stack.Item>
            </Stack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
