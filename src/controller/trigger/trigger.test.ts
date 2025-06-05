import { StatusCodes } from "http-status-codes";
import { createTriggerCreateData } from "./trigger";

describe("createTriggerCreateData", () => {
  it("should return OK and data for valid input", () => {
    const body = {
      workspace_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", // valid uuid
      group_type: "card_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", by: "user" },
      action: [
        {
          type: "<action>_the_card_to_a_specific_<position>_<optional_board>",
          group_type: "card_move",
          condition: { action: "move", list_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", position: "top_of_list" }
        }
      ]
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.OK);
    expect(result.data).toBeDefined();
    expect(result.data?.workspace_id).toBe(body.workspace_id);
    expect(result.data?.action).toEqual(body.action);
  });

  it("should return BAD_REQUEST if action is not array", () => {
    const body = {
      workspace_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e",
      group_type: "card_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", by: "user" },
      action: "not-an-array"
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toMatch(/action should be array/);
  });

  it("should return BAD_REQUEST if validateDataByGroupType returns error", () => {
    const body = {};
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toBeDefined();
  });

  it("should return BAD_REQUEST if workspace_id is not valid uuid", () => {
    const body = {
      workspace_id: "not-a-uuid",
      group_type: "card_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "not-a-uuid", by: "user" },
      action: [
        {
          type: "<action>_the_card_to_a_specific_<position>_<optional_board>",
          group_type: "card_move",
          condition: { action: "move", list_id: "not-a-uuid", position: "top_of_list" }
        }
      ]
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toMatch(/not valid workspace id/);
  });

  it("should return BAD_REQUEST if action item missing required fields", () => {
    const body = {
      workspace_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e",
      group_type: "card_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", by: "user" },
      action: [
        {
          // type is missing
          group_type: "card_move",
          condition: { action: "move", list_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", position: "top_of_list" }
        }
      ]
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toMatch(/'type' is required in action items/);
  });

  it("should return BAD_REQUEST if action.condition is not object", () => {
    const body = {
      workspace_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e",
      group_type: "card_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", by: "user" },
      action: [
        {
          type: "<action>_the_card_to_a_specific_<position>_<optional_board>",
          group_type: "card_move",
          condition: "not-an-object"
        }
      ]
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toMatch(/action.condition should be object/);
  });

  it("should return BAD_REQUEST if action.condition is not object", () => {
    const body = {
      workspace_id: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e",
      group_type: "aaaacard_move",
      type: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>",
      condition: { action: "added", board: "b7e6a1e2-8c2e-4b7a-9c1a-2b7e6a1e2a1e", by: "user" },
      action: [
        {
          type: "<action>_the_card_to_a_specific_<position>_<optional_board>",
          group_type: "card_move",
          condition: "not-an-object"
        }
      ]
    };
    const result = createTriggerCreateData(body);
    expect(result.status_code).toBe(StatusCodes.BAD_REQUEST);
    expect(result.message).toMatch(/group_type 'aaaacard_move' is not valid value/);
  });
});
