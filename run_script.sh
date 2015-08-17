#!/bin/sh -e

# Deployment script that do release new application code.

error_exit() {
    d=$(date '+%D %T :: ')
    echo "$d Error: $*" >&2
    rm -rf "${temp_dir}"
    exit 1
}

echo "Deploying Speed Dating Online ..."

# Prepare constants
timestamp=$(date +%s)
temp_dir="/var/www/.tmp"
versions_dir="/var/www/.versions"
application_dir="/var/www/project"
old_version_dir=$(readlink -f application_dir)
new_version_dir="$versions_dir/$timestamp"

# Creating folders
mkdir -p "${versions_dir}" || error_exit "Could not create deploy folders"

# Changing to $TEMP_DIR directory
echo "Changing temp_dir directory"
cd "$temp_dir" || error_exit "Could not change $temp_dir directory"
echo "Success!"

# Installing npm dependencies
echo "Installing npm dependencies"
npm install --production || error_exit "Could not install all npm dependencies"
echo "Success!"

# Installing bower dependencies
echo "Installing bower dependencies"
bower install || error_exit "Could not install all bower dependencies"

# Webpack static compile
echo "Webpack static compile"
npm run prod || error_exit "Could not compile static by webpack"

# Move the new version into the $NEW_VERSION_DIR folder
echo "Move the new version into the $new_version_dir folder"
cd ".." && mv "${temp_dir}" "${new_version_dir}" || error_exit "Could not move new version to ${new_version_dir} directory"

# Point symlink to the new version
rm -f "${application_dir}" && ln -sv "${new_version_dir}" "${application_dir}" || error_exit "Could not create symlink to ${new_version_dir}"

# Check nginx config shiped with new version and revert symlink if it fails
if ! (sudo service nginx reload)
then
    # Point symlink back the old version
    rm -f "${application_dir}" && ln -sv "${old_version_dir}" "${application_dir}" || error_exit "Could not create symlink to ${old_version_dir}"
    # Remove new vesrion because it's broken
    rm -rf "${new_version_dir}"
    # Exit with error
    error_exit "Could not reload nginx"
fi
echo "Success!"

# Restart via monit
echo "Restarting via Monit..."
sleep 1
sudo monit restart sdo

echo "Deployment Speed Dating Online Done!"
exit 0
