interface ImportMap {
	[module: string]: ModuleMap;
}

interface ModuleMap {
	// Key is imported name, value is local name (or null if not yet imported)
	[key: string]: string | null;
}

interface ModuleSpec {
	module: string,
	members: MemberSpec[]
}

interface MemberSpec {
	import: string,
	local: string
}

export default class Imports {

	private map: ImportMap;

	constructor() {
		this.map = {};
	}

	private ensureModule(module: string) {
		const map = this.map;

		if (!map[module]) {
			 map[module] = {};
		}

		return map[module];
	}

	private localName(entry: ModuleMap, key: string) {
		return entry[key] || key;
	}

	register(module: string, key: string, name: string) {
		this.ensureModule(module)[key] = name;
	}

	require(module: string, key: string) {
		const entry = this.ensureModule(module);
		entry[key] = entry[key] || null;

		return this.localName(entry, key);
	}

	getImportsToAdd(): ModuleSpec[] {
		return (
			Object
				.entries(this.map)
				.map(
					(entry) => ({
						module: entry[0],
						members: (
							Object
								.entries(entry[1])
								.filter((subentry) => subentry[1] == null)
								.map(
									(subentry) => ({
										import: subentry[0],
										local: this.localName(entry[1], subentry[0])
									})
								)
						)
					})
				)
				.filter((spec) => spec.members.length > 0)
		);
	}
}