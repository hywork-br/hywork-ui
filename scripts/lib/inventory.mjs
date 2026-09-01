function withoutWhitespace(source) {
  return source.replace(/\s+/gu, "");
}

export function classifySourceDifference(platformSource, builderSource) {
  if (platformSource === builderSource) return "identical";
  if (withoutWhitespace(platformSource) === withoutWhitespace(builderSource)) {
    return "format-only";
  }
  return "api-or-behavior";
}

export function analyzeSharedComponents(platformFiles, builderFiles) {
  const sharedNames = Object.keys(platformFiles)
    .filter((name) => Object.hasOwn(builderFiles, name))
    .sort();

  const components = sharedNames.map((filename) => ({
    name: filename.replace(/\.tsx$/u, ""),
    difference: classifySourceDifference(
      platformFiles[filename],
      builderFiles[filename],
    ),
  }));

  return {
    summary: {
      platformComponents: Object.keys(platformFiles).length,
      builderComponents: Object.keys(builderFiles).length,
      sharedComponents: components.length,
      identical: components.filter(({ difference }) => difference === "identical").length,
      formatOnly: components.filter(({ difference }) => difference === "format-only").length,
      apiOrBehavior: components.filter(
        ({ difference }) => difference === "api-or-behavior",
      ).length,
    },
    components,
  };
}
