import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api, { currentUser } from "../api";
import { uploadJournalFile } from "../media/journalTransfer";
import { renderAt } from "../testUtils";
import NewJournalPage from "./NewJournalPage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  currentUser: jest.fn(),
}));

jest.mock("../media/journalTransfer", () => ({
  uploadJournalFile: jest.fn(),
}));

test("posts a journal for the selected trail profile", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({
    data: [{ _id: "t1", name: "Garibaldi Lake", location: "Garibaldi Provincial Park, BC" }],
  });
  api.post.mockResolvedValue({ data: { _id: "p1" } });

  renderAt(<NewJournalPage />, "/journals/new");

  expect(await screen.findByRole("option", { name: /Garibaldi Lake/ })).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText(/Title/), "Morning loop");
  await userEvent.selectOptions(screen.getByLabelText(/Trail profile/), "t1");
  await userEvent.type(screen.getByLabelText(/What was it like/), "Snow on the ridge.");
  await userEvent.click(screen.getByRole("button", { name: "Post journal" }));

  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      "/api/blogs",
      expect.objectContaining({
        title: "Morning loop",
        trail: "t1",
        content: "Snow on the ridge.",
      })
    )
  );
});

test("shows socket progress while a photo is chunked to the server", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({
    data: [{ _id: "t1", name: "Garibaldi Lake", location: "Garibaldi Provincial Park, BC" }],
  });
  api.post.mockResolvedValue({ data: { _id: "p1" } });
  let finish = () => {};
  uploadJournalFile.mockImplementation((file, onProgress) => {
    onProgress({ loaded: file.size, stored: 0, total: file.size, phase: "received" });
    return new Promise((resolve) => {
      finish = () =>
        resolve({
          url: "https://bc-hiker-chat-app.s3.us-east-1.amazonaws.com/journals/6ab71c7ec9c03b0124c30255/ridge.jpg",
          kind: "image",
        });
    });
  });

  renderAt(<NewJournalPage />, "/journals/new");
  expect(await screen.findByRole("option", { name: /Garibaldi Lake/ })).toBeInTheDocument();
  const photo = new File(["ridge"], "ridge.jpg", { type: "image/jpeg" });
  await userEvent.upload(screen.getByLabelText(/Photos or videos/), photo);
  await userEvent.type(screen.getByLabelText(/Title/), "Morning loop");
  await userEvent.selectOptions(screen.getByLabelText(/Trail profile/), "t1");
  await userEvent.type(screen.getByLabelText(/What was it like/), "Snow on the ridge.");
  await userEvent.click(screen.getByRole("button", { name: "Post journal" }));

  expect(await screen.findByText("Received 100%. Saved 0%.")).toBeInTheDocument();
  finish();

  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      "/api/blogs",
      expect.objectContaining({
        images: [
          "https://bc-hiker-chat-app.s3.us-east-1.amazonaws.com/journals/6ab71c7ec9c03b0124c30255/ridge.jpg",
        ],
        videos: [],
      })
    )
  );
});
