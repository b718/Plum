import json
import subprocess

def main():
    package_name = input("Please enter package name: ")
    create_package(package_name)
    update_package_jsons(package_name)
    print(f"Succesfully created '{package_name}' package!")

def create_package(package_name: str) -> None:
    package_path = f"../packages/{package_name}/src"
    package_json_content = create_package_json_content(package_name)

    subprocess.run(["mkdir", "-p", package_path])
    subprocess.run(["touch", package_path + f"/{package_name}.ts"])
    with open(f"{package_path}/../package.json", "w") as f:
        f.write(package_json_content)

def create_package_json_content(package_name: str) -> str:
    json_content = {
        "name": f"@plum/{package_name}",
        "version": "1.0.0",
        "module": f"./src/{package_name}.ts",
        "types": f"./src/{package_name}.ts",
        "exports": {
            ".": f"./src/{package_name}.ts"
        }
    }
    return json.dumps(json_content, indent=2)

def update_package_jsons(package_name: str) -> None:
    paths = ["../front_end/package.json", "../back_end/package.json"]
    new_package = f"@plum/{package_name}"

    for path in paths:
        with open(path, "r+") as file:
            package_content = json.load(file)
            package_content["dependencies"][new_package] = "workspace:*"

            """Bring to the start of the file delete everything before rewrite"""
            file.seek(0)
            file.truncate()
            json.dump(package_content, file, indent=2)

if __name__ == "__main__":
    main()