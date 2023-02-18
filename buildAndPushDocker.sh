# ! /bin/bash

tag=$(node -p -e "require('./package.json').version+"-"+(new Date()).toISOString().replace(/\D/g,'')")
echo "It will be tagged: $tag"
docker build . -t midoelhawy/inter-cluster-queue-manager:$tag
docker push midoelhawy/inter-cluster-queue-manager:$tag
