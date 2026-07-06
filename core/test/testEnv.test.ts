describe("Test environment", () => {
  test("should have DWARF_GLOBAL_DIR env var set to .dwarf-test", () => {
    expect(process.env.DWARF_GLOBAL_DIR).toBeDefined();
    expect(process.env.DWARF_GLOBAL_DIR)?.toMatch(/\.dwarf-test$/);
  });
});
