    import Erlang from '__lib/erlang';
    import Kernel from '__lib/kernel';
    import Tuple from '__lib/tuple';
    import fun from '__lib/funcy/fun';
    const __MODULE__ = Erlang.atom('Calc');
    let add = fun([[fun.parameter, fun.parameter], function(first,second)    {
        return     first + second;
      }]);
    export default {
        add: add
  };