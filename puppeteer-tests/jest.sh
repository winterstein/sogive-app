# Wrapper for wwappbase jest.sh
# Prefered this to simply simlinking from appbase for two reasons:
# 1) It means that scripts expecting the old call format ./jest.sh test will still work
# 2) Users won't have to add an extra paramater like ./jest.sh adserver test to the call
# Still get all of the benefits of DRY code, without the additional hassle

~/winterwell/wwappbase.js/test-base/jest.sh -s sogive "$@"