describe("Test environment", () => {
  test("should have MANGO_GLOBAL_DIR env var set to .mango-test", () => {
    expect(process.env.MANGO_GLOBAL_DIR).toBeDefined();
    expect(process.env.MANGO_GLOBAL_DIR)?.toMatch(/\.mango-test$/);
  });
});
