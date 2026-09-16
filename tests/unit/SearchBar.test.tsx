import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import SearchBar from "../../src/components/SearchBar";

describe("SearchBar", () => {
  it("does not call onSearch when the input is empty", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does not call onSearch when the input contains only spaces", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("Nome da cidade"), {
      target: { value: "   " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("does not call onSearch for a query shorter than two characters", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    fireEvent.change(screen.getByLabelText("Nome da cidade"), {
      target: { value: "S" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("calls onSearch with the trimmed value when the user submits a term", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByLabelText("Nome da cidade");
    fireEvent.change(input, { target: { value: "  São Paulo  " } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith("São Paulo");
  });
});
