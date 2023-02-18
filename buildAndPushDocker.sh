# ! /bin/bash

tag=$(node -p -e "require('./package.json').version")
echo "It will be tagged: $tag"
docker build . -t midoelhawy/inter-cluster-queue-manager:$tag  -t midoelhawy/inter-cluster-queue-manager:latest
docker push midoelhawy/inter-cluster-queue-manager:$tag 
docker push midoelhawy/inter-cluster-queue-manager:latest
