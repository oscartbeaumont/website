import { For, Match, Show, Switch } from "solid-js";
import { CaptureAsPdf } from "./CaptureAsPdf";
import { createMutableLocalStorage } from "./util";
import { createDateNow } from "@solid-primitives/date";
import parse from "parse-duration";

const defaultClient = () =>
  ({
    name: "A software company",
    identifier: "ABN: 00 000 000 000",
    address: "00 Road St, Suburb AA 0000",
    email: "employer@example.com",
    website: "https://example.com",
  } as {
    name: string;
    email: string;
    identifier?: string;
    address?: string;
    website?: string;
  });

function initState() {
  const client = defaultClient();
  return createMutableLocalStorage("invoicer", {
    invoiceId: 0,
    dueInDays: 14,
    client,
    hourlyRate: 5,
    tasks: [] as { name: string; hours: string }[],
    clients: [] as (typeof client)[],
    paymentMethod: "Swift" as "Swift" | "PayPal" | "Other",
    swiftCode: "--------",
    accountNumber: "-------------",
  });
}

export function Root() {
  const state = initState();

  return (
    <div class="flex justify-between">
      <div id="document" class="flex flex-col">
        <InvoiceTemplate state={state} />
      </div>

      <Sidebar state={state} />
    </div>
  );
}

function InvoiceTemplate(props: { state: ReturnType<typeof initState> }) {
  const [now] = createDateNow(30_000);

  return (
    <>
      <div class="h-1/5 w-full bg-[#1f65a6] text-white flex justify-between p-8">
        <div class="pt-5">
          <img src="/assets/OscarBeaumontLogo-White.png" class="h-12" />
          <h1 class="font-bold text-5xl -mt-2">Tax Invoice</h1>
        </div>

        <div class="flex flex-col space-y-[2px] justify-center items-end">
          <h1 class="text-2xl font-bold">BEAUMONT, OSCAR THOMAS</h1>
          <p class="text-md pt-[2px] font-light">oscar@otbeaumont.me</p>
          <p class="text-md font-light">ABN 97 277 414 018</p>
          <p class="text-md font-light">132B Raleigh Street, Perth WA 6101</p>
        </div>
      </div>
      <div class="w-full h-2/5">
        <div class="flex justify-between p-8">
          <div class="flex flex-col space-y-1">
            <p class="font-bold">BILL TO:</p>
            <p
              class="text-xl font-bold"
              contenteditable
              onFocusOut={(e) =>
                (props.state.client.name = e.currentTarget.textContent || "")
              }
            >
              {props.state.client.name}
            </p>
            <div class="flex flex-col">
              <Show when={props.state.client.identifier}>
                <p
                  contenteditable
                  onFocusOut={(e) =>
                    (props.state.client.identifier =
                      e.currentTarget.textContent || "")
                  }
                >
                  {props.state.client.identifier}
                </p>
              </Show>
              <Show when={props.state.client.address}>
                <p
                  contenteditable
                  onFocusOut={(e) =>
                    (props.state.client.address =
                      e.currentTarget.textContent || "")
                  }
                >
                  {props.state.client.address}
                </p>
              </Show>
              <p
                contenteditable
                onFocusOut={(e) =>
                  (props.state.client.email = e.currentTarget.textContent || "")
                }
              >
                {props.state.client.email}
              </p>
              <Show when={props.state.client.website}>
                <p
                  contenteditable
                  onFocusOut={(e) =>
                    (props.state.client.website =
                      e.currentTarget.textContent || "")
                  }
                >
                  {props.state.client.website}
                </p>
              </Show>
            </div>
          </div>
          <div class="flex flex-col space-y-1 text-end">
            <div>
              <p class="font-bold">INVOICE #</p>
              <p>{props.state.invoiceId.toString().padStart(4, "0")}</p>
            </div>
            <div>
              <p class="font-bold">DATE</p>
              <p>{formatDate(now())}</p>
            </div>
            <div>
              <p class="font-bold">INVOICE DUE DATE</p>
              <p>
                {formatDate(
                  new Date(
                    now().getTime() +
                      props.state.dueInDays * 24 * 60 * 60 * 1000
                  )
                )}
              </p>
            </div>
          </div>
        </div>

        <div class="h-1 w-full bg-gray-200"></div>

        <div class="p-4 pt-10 w-full space-x-2">
          <table class="w-full">
            <thead>
              <tr class="w-full flex space-x-4">
                <th class="w-full text-start">DESCRIPTION</th>
                <th class="w-24 text-end">HOURS</th>
                <th class="w-24 text-end">HOURLY</th>
                <th class="w-24 text-end">TOTAL</th>
              </tr>
            </thead>

            <tbody>
              <For each={props.state.tasks}>
                {(task) => (
                  <tr class="w-full flex space-x-4 pt-2 rtex">
                    <td class="w-full text-start">
                      <p
                        contenteditable
                        onFocusOut={(e) =>
                          (task.name = e.currentTarget.textContent || "")
                        }
                      >
                        {task.name}
                      </p>
                    </td>
                    <td class="w-24 text-end">
                      <p
                        contentEditable
                        // We do this so if the user doesn't enter a valid number, it doesn't break
                        onFocusOut={(e) =>
                          (task.hours = e.currentTarget.textContent || "0")
                        }
                      >
                        {(task.hours ?? 0).toString()}
                      </p>
                    </td>
                    <td class="w-24 text-end">
                      ${props.state.hourlyRate.toFixed(2)}
                    </td>
                    <td class="w-24 text-end">
                      $
                      {(toHours(task.hours) * props.state.hourlyRate).toFixed(
                        2
                      )}
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </div>
      </div>
      <div class="h-2/5 bg-blue-100 flex justify-between">
        <div class="w-2/3 py-20 px-8 text-xl font-light">
          <p class="font-bold">NOTES:</p>
          <Switch
            fallback={
              <p>Payment to be done by previously agreed upon terms.</p>
            }
          >
            <Match when={props.state.paymentMethod === "Swift"}>
              <p>
                Payment to be done via international bank transfer to <br />
                Bankwest <br />
                PO Box E237 Perth WA 6841
                <br /> BIC:{" "}
                <span
                  contentEditable
                  onFocusOut={(e) =>
                    (props.state.swiftCode = e.currentTarget.textContent || "")
                  }
                >
                  {props.state.swiftCode}
                </span>
                <br /> Account:{" "}
                <span
                  contentEditable
                  onFocusOut={(e) =>
                    (props.state.accountNumber =
                      e.currentTarget.textContent || "")
                  }
                >
                  {props.state.accountNumber}
                </span>
              </p>
            </Match>
            <Match when={props.state.paymentMethod === "PayPal"}>
              <p>
                Payment to be done via PayPal and transferred to the email
                <span class="pl-1 text-blue-700">oscar@otbeaumont.me</span>.
              </p>
            </Match>{" "}
          </Switch>

          <p class="pt-8">Thank you,</p>
          <p>It's been a pleasure working with you.</p>
        </div>

        <div class="bg-[#1f65a6] text-white flex flex-col items-end justify-center py-8 px-4 text-end">
          <p class="font-bold text-xl tracking-wide">TOTAL</p>
          <p class="-mt-3 font-bold text-[40px] tracking-tight text-nowrap">
            USD $
            {(
              props.state.tasks
                .map((task) => toHours(task.hours))
                .reduce((a, b) => a + b, 0) * props.state.hourlyRate
            ).toFixed(2)}
          </p>
        </div>
      </div>
    </>
  );
}

function Sidebar(props: { state: ReturnType<typeof initState> }) {
  return (
    <div class="w-[500px] bg-black/70 backdrop-blur-xl p-4 flex flex-col space-y-4 fixed top-0 bottom-0 right-0">
      <div class="flex justify-between">
        <h1 class="text-2xl font-extrabold uppercase text-nowrap flex items-center text-white">
          Invoicer
        </h1>

        <CaptureAsPdf />
      </div>

      <p class="font-bold uppercase text-md text-white">Invoice identifier:</p>
      <div class="flex">
        <input
          class="text-black p-2"
          value={props.state.invoiceId.toString().padStart(4, "0")}
          onChange={(e) =>
            (props.state.invoiceId = parseInt(e.currentTarget.value))
          }
          placeholder="0000"
        />
        <button
          class="bg-white text-black font-bold uppercase rounded-md ml-4 py-2 px-4"
          onClick={() => props.state.invoiceId++}
        >
          Next
        </button>
      </div>

      <p class="font-bold uppercase text-md text-white">Invoice due in days:</p>
      <input
        class="p-2"
        value={props.state.dueInDays.toString()}
        onChange={(e) =>
          (props.state.dueInDays = parseInt(e.currentTarget.value))
        }
        placeholder="14"
      />

      <p class="font-bold uppercase text-md text-white">Hourly rate:</p>
      <input
        class="p-2"
        value={props.state.hourlyRate.toString()}
        onChange={(e) =>
          (props.state.hourlyRate = parseFloat(e.currentTarget.value))
        }
        placeholder="70"
      />

      <p class="font-bold uppercase text-md text-white">Client:</p>
      <div class="flex space-x-2 w-full">
        <button
          class="w-full bg-white text-black font-bold uppercase rounded-md ml-4 py-2 px-4"
          onClick={() =>
            props.state.clients.push(
              JSON.parse(JSON.stringify(props.state.client))
            )
          }
        >
          Save
        </button>
        <button
          class="w-full bg-white text-black font-bold uppercase rounded-md ml-4 py-2 px-4"
          onClick={() => (props.state.client = defaultClient())}
        >
          Reset
        </button>
      </div>
      <For each={props.state.clients}>
        {(client, i) => (
          <div class="flex space-x-2 w-full">
            <button
              class="bg-white text-black font-bold uppercase rounded-md py-2 px-4"
              onClick={() => (props.state.client = client)}
            >
              {client.name}
            </button>
            <button
              class="bg-white text-black font-bold uppercase rounded-md py-2 px-4"
              onClick={() => props.state.clients.splice(i(), 1)}
            >
              Remove
            </button>
          </div>
        )}
      </For>

      <p class="font-bold uppercase text-md text-white">Tasks:</p>
      <button
        class="bg-white text-black font-bold uppercase rounded-md ml-4 py-2 px-4"
        onClick={() =>
          props.state.tasks.push({
            name: "Did the thing",
            hours: "0",
          })
        }
      >
        New
      </button>
      <button
        class="bg-white text-black font-bold uppercase rounded-md ml-4 py-2 px-4"
        onClick={() => props.state.tasks.pop()}
      >
        Remove
      </button>

      <p class="font-bold uppercase text-md text-white">Payment Method:</p>
      <select
        value={props.state.paymentMethod}
        onChange={(e) =>
          (props.state.paymentMethod = e.currentTarget.value as any)
        }
      >
        <option value="PayPal">PayPal</option>
        <option value="Swift">Swift</option>
        <option value="Other">Other</option>
      </select>
    </div>
  );
}

function formatDate(date: Date) {
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${date.getFullYear()}`;
}

function toHours(time: string) {
  // Basic numbers are treated as hours
  const num = Number(time);
  if (!Number.isNaN(num)) return num;

  // Else parse components
  const r = parse(time);
  if (r === null || r === undefined) return NaN;
  return r / 1000 / 60 / 60;
}
