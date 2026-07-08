const webpack = require("@nativescript/webpack");
const childProcess = require("child_process");
const path = require("path");

function isTypeScript7Compiler() {
	try {
		const typescript = require("typescript");
		return (
			typeof typescript.version === "string" &&
			typescript.version.startsWith("7.") &&
			(typescript.sys === undefined ||
				typeof typescript.transpileModule !== "function")
		);
	} catch (_e) {
		return false;
	}
}

class TypeScript7TypeCheckPlugin {
	apply(compiler) {
		compiler.hooks.beforeCompile.tap("TypeScript7TypeCheckPlugin", () => {
			const projectRoot = compiler.context || process.cwd();
			childProcess.execFileSync(
				process.execPath,
				[
					path.join(
						path.dirname(require.resolve("typescript/package.json")),
						"bin",
						"tsc"
					),
					"--noEmit",
					"--pretty",
					"false",
					"--project",
					path.join(projectRoot, "tsconfig.json"),
				],
				{
					cwd: projectRoot,
					stdio: "inherit",
				}
			);
		});
	}
}

module.exports = (env) => {
	webpack.init(env);

	// Learn how to customize:
	// https://docs.nativescript.org/webpack

	webpack.chainWebpack((config) => {
		if (isTypeScript7Compiler()) {
			config.plugin("TypeScript7TypeCheckPlugin").use(TypeScript7TypeCheckPlugin);
		}
	});

	return webpack.resolveConfig();
};
