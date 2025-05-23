import type { HighlightId } from "@cursorless/common";
import { ide } from "../singletons/ide.singleton";
import type { Target } from "../typings/target.types";
import {
  runOnTargetsForEachEditor,
  toGeneralizedRange,
} from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class Highlight {
  constructor() {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    highlightId?: HighlightId,
  ): Promise<ActionReturnValue> {
    if (ide().capabilities.commands["highlight"] == null) {
      throw Error(`The highlight action is not supported by your ide`);
    }

    if (targets.length === 0) {
      // Special case to clear highlights for all editors when user says
      // "highlight nothing"
      await Promise.all(
        ide().visibleTextEditors.map((editor) =>
          ide().setHighlightRanges(highlightId, editor, []),
        ),
      );
    } else {
      await runOnTargetsForEachEditor(targets, (editor, targets) =>
        ide().setHighlightRanges(
          highlightId,
          editor,
          targets.map((target) =>
            toGeneralizedRange(target, target.contentRange),
          ),
        ),
      );
    }

    return {
      thatTargets: targets,
    };
  }
}
