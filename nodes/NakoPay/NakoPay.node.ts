import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from "n8n-workflow";

const API_BASE = "https://daslrxpkbkqrbnjwouiq.supabase.co/functions/v1";
const API_VERSION = "2025-04-20";

export class NakoPay implements INodeType {
  description: INodeTypeDescription = {
    displayName: "NakoPay",
    name: "nakoPay",
    icon: "file:nakopay.svg",
    group: ["transform"],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: "Accept Bitcoin and crypto payments via NakoPay",
    defaults: {
      name: "NakoPay",
    },
    inputs: ["main"],
    outputs: ["main"],
    credentials: [
      {
        name: "nakoPayApi",
        required: true,
      },
    ],
    properties: [
      {
        displayName: "Resource",
        name: "resource",
        type: "options",
        noDataExpression: true,
        options: [
          { name: "Invoice", value: "invoice" },
          { name: "Payment Link", value: "paymentLink" },
          { name: "Customer", value: "customer" },
        ],
        default: "invoice",
      },
      // Invoice operations
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["invoice"] } },
        options: [
          { name: "Create", value: "create", action: "Create an invoice" },
          { name: "Get", value: "get", action: "Get an invoice" },
          { name: "List", value: "list", action: "List invoices" },
          { name: "Cancel", value: "cancel", action: "Cancel an invoice" },
        ],
        default: "create",
      },
      // Invoice create fields
      {
        displayName: "Amount",
        name: "amount",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { resource: ["invoice"], operation: ["create"] } },
        description: "Payment amount in fiat (decimal string)",
      },
      {
        displayName: "Currency",
        name: "currency",
        type: "string",
        default: "USD",
        required: true,
        displayOptions: { show: { resource: ["invoice"], operation: ["create"] } },
      },
      {
        displayName: "Coin",
        name: "coin",
        type: "options",
        options: [
          { name: "Bitcoin (BTC)", value: "BTC" },
          { name: "Litecoin (LTC)", value: "LTC" },
          { name: "Monero (XMR)", value: "XMR" },
        ],
        default: "BTC",
        required: true,
        displayOptions: { show: { resource: ["invoice"], operation: ["create"] } },
      },
      {
        displayName: "Description",
        name: "description",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["invoice"], operation: ["create"] } },
      },
      {
        displayName: "Customer Email",
        name: "customerEmail",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["invoice"], operation: ["create"] } },
      },
      // Invoice get/cancel fields
      {
        displayName: "Invoice ID",
        name: "invoiceId",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { resource: ["invoice"], operation: ["get", "cancel"] } },
      },
      // Invoice list fields
      {
        displayName: "Status Filter",
        name: "statusFilter",
        type: "options",
        options: [
          { name: "All", value: "" },
          { name: "Pending", value: "pending" },
          { name: "Paid", value: "paid" },
          { name: "Expired", value: "expired" },
          { name: "Canceled", value: "canceled" },
        ],
        default: "",
        displayOptions: { show: { resource: ["invoice"], operation: ["list"] } },
      },
      {
        displayName: "Limit",
        name: "limit",
        type: "number",
        default: 20,
        displayOptions: { show: { resource: ["invoice"], operation: ["list"] } },
      },
      // Payment Link operations
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["paymentLink"] } },
        options: [
          { name: "Create", value: "create", action: "Create a payment link" },
        ],
        default: "create",
      },
      {
        displayName: "Amount",
        name: "plAmount",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["paymentLink"], operation: ["create"] } },
      },
      {
        displayName: "Currency",
        name: "plCurrency",
        type: "string",
        default: "USD",
        displayOptions: { show: { resource: ["paymentLink"], operation: ["create"] } },
      },
      {
        displayName: "Description",
        name: "plDescription",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["paymentLink"], operation: ["create"] } },
      },
      // Customer operations
      {
        displayName: "Operation",
        name: "operation",
        type: "options",
        noDataExpression: true,
        displayOptions: { show: { resource: ["customer"] } },
        options: [
          { name: "Create", value: "create", action: "Create a customer" },
          { name: "Get", value: "get", action: "Get a customer" },
        ],
        default: "create",
      },
      {
        displayName: "Email",
        name: "custEmail",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["customer"], operation: ["create"] } },
      },
      {
        displayName: "Name",
        name: "custName",
        type: "string",
        default: "",
        displayOptions: { show: { resource: ["customer"], operation: ["create"] } },
      },
      {
        displayName: "Customer ID",
        name: "custId",
        type: "string",
        default: "",
        required: true,
        displayOptions: { show: { resource: ["customer"], operation: ["get"] } },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const results: INodeExecutionData[] = [];
    const credentials = await this.getCredentials("nakoPayApi");
    const apiKey = credentials.apiKey as string;

    for (let i = 0; i < items.length; i++) {
      const resource = this.getNodeParameter("resource", i) as string;
      const operation = this.getNodeParameter("operation", i) as string;

      let endpoint = "";
      let method = "GET";
      let body: Record<string, unknown> | undefined;
      let qs: Record<string, string> = {};

      if (resource === "invoice") {
        if (operation === "create") {
          endpoint = "/invoices-create";
          method = "POST";
          body = {
            amount: this.getNodeParameter("amount", i) as string,
            currency: this.getNodeParameter("currency", i) as string,
            coin: this.getNodeParameter("coin", i) as string,
            description: this.getNodeParameter("description", i, "") as string,
            customer_email: this.getNodeParameter("customerEmail", i, "") as string,
            metadata: { source: "n8n" },
          };
        } else if (operation === "get") {
          endpoint = "/invoices-get";
          qs.id = this.getNodeParameter("invoiceId", i) as string;
        } else if (operation === "list") {
          endpoint = "/invoices-list";
          const status = this.getNodeParameter("statusFilter", i, "") as string;
          if (status) qs.status = status;
          qs.limit = String(this.getNodeParameter("limit", i, 20));
        } else if (operation === "cancel") {
          endpoint = "/invoices-cancel";
          method = "POST";
          body = { id: this.getNodeParameter("invoiceId", i) as string };
        }
      } else if (resource === "paymentLink") {
        endpoint = "/payment-links";
        method = "POST";
        body = {
          amount: this.getNodeParameter("plAmount", i, "") as string,
          currency: this.getNodeParameter("plCurrency", i, "USD") as string,
          description: this.getNodeParameter("plDescription", i, "") as string,
        };
      } else if (resource === "customer") {
        if (operation === "create") {
          endpoint = "/customers";
          method = "POST";
          body = {
            email: this.getNodeParameter("custEmail", i, "") as string,
            name: this.getNodeParameter("custName", i, "") as string,
          };
        } else if (operation === "get") {
          endpoint = "/customers";
          qs.id = this.getNodeParameter("custId", i) as string;
        }
      }

      const url = new URL(API_BASE + endpoint);
      Object.entries(qs).forEach(([k, v]) => { if (v) url.searchParams.set(k, v); });

      const headers: Record<string, string> = {
        Authorization: `Bearer ${apiKey}`,
        "X-NakoPay-Version": API_VERSION,
        Accept: "application/json",
        "User-Agent": "NakoPay-n8n/1.0.0",
      };
      if (body) {
        headers["Content-Type"] = "application/json";
        headers["Idempotency-Key"] = `idem_n8n_${Date.now()}_${i}`;
      }

      const resp = await this.helpers.httpRequest({
        url: url.toString(),
        method: method as any,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        returnFullResponse: true,
      });

      const json = typeof resp.body === "string" ? JSON.parse(resp.body) : resp.body;
      results.push({ json });
    }

    return [results];
  }
}
