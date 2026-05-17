import type {
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class NakoPayApi implements ICredentialType {
  name = "nakoPayApi";
  displayName = "NakoPay API";
  documentationUrl = "https://nakopay.com/docs/sdk/node";
  properties: INodeProperties[] = [
    {
      displayName: "Secret API Key",
      name: "apiKey",
      type: "string",
      typeOptions: { password: true },
      default: "",
      placeholder: "sk_test_...",
      description:
        "Your NakoPay secret key. Get one at nakopay.com/dashboard/api-keys.",
    } as any,
    {
      displayName: "Mode",
      name: "mode",
      type: "options",
      options: [
        { name: "Test", value: "test" },
        { name: "Live", value: "live" },
      ],
      default: "test",
    } as any,
  ];
}
