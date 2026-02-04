/**
 * Converts any text into a valid HTML ID attribute value.
 * Returns empty string if text becomes empty after removing invalid characters.
 *
 * @param {string} text - The text to convert into an HTML ID
 * @returns {string} A valid HTML ID or empty string
 */
export function toHTMLId(text: string): string;
/**
 * @template {OptionMatch|Option} T
 * @param {T[]} options
 * @param {string[]} values
 * @returns {T[]}
 */
export function sortValuesToTop<T extends OptionMatch | Option>(options: T[], values: string[]): T[];
/**
 * Calculates the match score between a query text and a list of option labels.
 * It returns scores for each option sorted in descending order.
 *
 * It takes the `query` string, evaluates the following rules in order and assigns the one with highest score:
 * - Score 7: If whole query matches a label on an option (Case insensitive match)
 * - Score 5: Same as previous check but this time case and accent insensitive matching
 * - Score 3: Phrase matching (e.g. "word1 partialWord2*")
 * - Score 0-1: Number of words matched / total number of words in query (e.g. "word1")
 *
 * @param {string} query - The query text to match against options.
 * @param {Option[]} options
 * @param {string} [language='en'] Language to use for word splitting and matching
 * @param {boolean} [filterAndSort=true] Whether to filter and sort the results. If false, returns all options but with attempted matches.
 * @returns {Array<OptionMatch>}
 */
export function getMatchScore(query: string, options: Option[], language?: string, filterAndSort?: boolean): Array<OptionMatch>;
/**
 * @param {OptionMatch['matchSlices']} matchSlices
 * @param {string} text
 * @returns {VNode[]}
 */
export function matchSlicesToNodes(matchSlices: OptionMatch["matchSlices"], text: string): VNode[];
export type Option = import("./PreactCombobox.jsx").Option;
export type OptionMatch = import("./PreactCombobox.jsx").OptionMatch;
export type VNode = import("preact").VNode;
/**
 * Cache for language-specific word segmenters
 */
export type LanguageCache = {
    /**
     * - The base matcher for the language
     */
    baseMatcher: Intl.Collator;
    /**
     * - The case matcher for the language
     */
    caseMatcher: Intl.Collator;
    /**
     * - The word segmenter for the language
     */
    wordSegmenter: Intl.Segmenter;
};
